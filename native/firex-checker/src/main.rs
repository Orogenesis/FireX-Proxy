mod app;
mod checker;
mod cli;
mod native_host;
mod native_io;
mod protocol;
mod proxy_file;

use anyhow::Result;
use app::AppCommand;

#[tokio::main]
async fn main() -> Result<()> {
    AppCommand::from_env()?.run().await
}
