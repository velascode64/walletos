use std::{
    env,
    io::{BufRead, BufReader, Write},
    path::{Path, PathBuf},
    process::{Command, Output, Stdio},
    thread,
};

pub trait AgentAdapter: Send + Sync {
    fn id(&self) -> &'static str;
    fn is_available(&self) -> bool;
    fn start_task(&self, prompt: &str, model: &str) -> Result<Output, String>;
}

pub struct CodexAdapter;
pub struct GeminiAdapter;
pub struct CopilotAdapter;

impl AgentAdapter for CodexAdapter {
    fn id(&self) -> &'static str {
        "codex"
    }

    fn is_available(&self) -> bool {
        command_available(&resolve_command("CODEX_BIN", "codex"))
    }

    fn start_task(&self, prompt: &str, model: &str) -> Result<Output, String> {
        let command = resolve_command("CODEX_BIN", "codex");
        run_command(
            command,
            vec![
                "exec".into(),
                "--model".into(),
                model.into(),
                "--skip-git-repo-check".into(),
                "--sandbox".into(),
                "read-only".into(),
                "-".into(),
            ],
            prompt,
            runtime_dir(),
        )
    }
}

impl AgentAdapter for GeminiAdapter {
    fn id(&self) -> &'static str {
        "gemini"
    }

    fn is_available(&self) -> bool {
        command_available(&resolve_command("GEMINI_BIN", "gemini"))
    }

    fn start_task(&self, prompt: &str, model: &str) -> Result<Output, String> {
        let command = resolve_command("GEMINI_BIN", "gemini");
        let mut args = vec!["-p".into(), prompt.into()];
        if !model.is_empty() && model != "default" {
            args.splice(0..0, ["--model".into(), model.into()]);
        }
        run_command(command, args, "", runtime_dir())
    }
}

impl AgentAdapter for CopilotAdapter {
    fn id(&self) -> &'static str {
        "copilot"
    }

    fn is_available(&self) -> bool {
        command_available(&resolve_command("COPILOT_BIN", "copilot"))
    }

    fn start_task(&self, prompt: &str, model: &str) -> Result<Output, String> {
        let command = resolve_command("COPILOT_BIN", "copilot");
        load_project_env();
        let graph_api_key = env::var("THEGRAPH_API_KEY")
            .or_else(|_| env::var("THE_GRAPH_API_KEY"))
            .map_err(|_| {
                "THE_GRAPH_API_KEY is not configured. Export a valid The Graph API key before running the portfolio test.".to_string()
            })?;
        let mcp_config = serde_json::json!({
            "mcpServers": {
                "the-graph-subgraph": {
                    "type": "sse",
                    "url": "https://subgraphs.mcp.thegraph.com/sse",
                    "headers": {
                        "Authorization": format!("Bearer {graph_api_key}")
                    }
                }
            }
        })
        .to_string();
        let mut args = vec![
            "--prompt".into(),
            prompt.into(),
            "--allow-all-tools".into(),
            "--allow-all-mcp-server-instructions".into(),
            "--enable-mcp-server".into(),
            "the-graph-subgraph".into(),
            "--additional-mcp-config".into(),
            mcp_config,
        ];
        if !model.is_empty() && model != "default" {
            args.splice(0..0, ["--model".into(), model.into()]);
        }
        run_command(command, args, "", runtime_dir())
    }
}

pub fn adapter_for(agent: &str) -> Box<dyn AgentAdapter> {
    match agent.to_ascii_lowercase().as_str() {
        "copilot" | "github-copilot-cli" => Box::new(CopilotAdapter),
        "gemini" | "google-gemini-cli" => Box::new(GeminiAdapter),
        _ => Box::new(CodexAdapter),
    }
}

fn resolve_command(variable: &str, fallback: &str) -> String {
    env::var(variable).unwrap_or_else(|_| fallback.to_string())
}

fn command_available(command: &str) -> bool {
    Command::new(command)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

fn runtime_dir() -> PathBuf {
    let current = env::current_dir().unwrap_or_else(|_| Path::new(".").to_path_buf());
    current
        .ancestors()
        .find(|path| path.join("runtime/AGENTS.md").is_file())
        .map(|path| path.join("runtime"))
        .unwrap_or(current)
}

fn load_project_env() {
    let current = env::current_dir().unwrap_or_else(|_| Path::new(".").to_path_buf());
    if let Some(env_file) = current
        .ancestors()
        .map(|path| path.join(".env"))
        .find(|path| path.is_file())
    {
        let _ = dotenvy::from_path(env_file);
    }
}

fn run_command(
    command: String,
    args: Vec<String>,
    prompt: &str,
    working_dir: PathBuf,
) -> Result<Output, String> {
    let mut child = Command::new(&command)
        .args(args)
        .current_dir(working_dir)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("Could not start {command}: {error}"))?;

    if !prompt.is_empty() {
        if let Some(mut stdin) = child.stdin.take() {
            stdin
                .write_all(prompt.as_bytes())
                .map_err(|error| format!("Could not write agent prompt: {error}"))?;
        }
    }

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Agent process did not expose stdout.".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "Agent process did not expose stderr.".to_string())?;
    let stdout_thread = spawn_output_logger(stdout, "copilot");
    let stderr_thread = spawn_output_logger(stderr, "copilot:error");
    let status = child
        .wait()
        .map_err(|error| format!("Agent process failed: {error}"))?;
    let stdout = stdout_thread
        .join()
        .map_err(|_| "Agent stdout logger failed.".to_string())?;
    let stderr = stderr_thread
        .join()
        .map_err(|_| "Agent stderr logger failed.".to_string())?;

    Ok(Output {
        status,
        stdout,
        stderr,
    })
}

fn spawn_output_logger<R>(reader: R, label: &'static str) -> thread::JoinHandle<Vec<u8>>
where
    R: std::io::Read + Send + 'static,
{
    thread::spawn(move || {
        let mut output = Vec::new();
        for line in BufReader::new(reader).lines().map_while(Result::ok) {
            let safe_line = redact_sensitive_output(&line);
            eprintln!("[{label}] {safe_line}");
            output.extend_from_slice(safe_line.as_bytes());
            output.push(b'\n');
        }
        output
    })
}

fn redact_sensitive_output(value: &str) -> String {
    let mut output = value.to_string();
    if let Ok(api_key) = env::var("THEGRAPH_API_KEY").or_else(|_| env::var("THE_GRAPH_API_KEY")) {
        if !api_key.is_empty() {
            output = output.replace(&api_key, "[REDACTED_THEGRAPH_API_KEY]");
        }
    }
    output
}
