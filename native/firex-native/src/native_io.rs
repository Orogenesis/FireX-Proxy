use std::io::{self, Read, Write};

use anyhow::{bail, Context, Result};
use serde::{de::DeserializeOwned, Serialize};

const MAX_INCOMING_BYTES: usize = 64 * 1024 * 1024;
const MAX_OUTGOING_BYTES: usize = 1024 * 1024;

pub fn read_message<T: DeserializeOwned>(input: &mut impl Read) -> Result<Option<T>> {
    let mut length_bytes = [0_u8; 4];

    match input.read_exact(&mut length_bytes) {
        Ok(()) => {}
        Err(error) if error.kind() == io::ErrorKind::UnexpectedEof => return Ok(None),
        Err(error) => return Err(error).context("failed to read native message length"),
    }

    let length = u32::from_ne_bytes(length_bytes) as usize;
    if length > MAX_INCOMING_BYTES {
        bail!("native message is too large: {length} bytes");
    }

    let mut payload = vec![0_u8; length];
    input
        .read_exact(&mut payload)
        .context("failed to read native message payload")?;

    serde_json::from_slice(&payload).context("failed to decode native message")
}

pub fn write_message<T: Serialize>(output: &mut impl Write, message: &T) -> Result<()> {
    let payload = serde_json::to_vec(message).context("failed to encode native message")?;

    if payload.len() > MAX_OUTGOING_BYTES {
        bail!("native response is too large: {} bytes", payload.len());
    }

    output
        .write_all(&(payload.len() as u32).to_ne_bytes())
        .context("failed to write native message length")?;
    output
        .write_all(&payload)
        .context("failed to write native message payload")?;
    output.flush().context("failed to flush native message")
}
