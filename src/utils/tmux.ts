import { execCommand } from '.';

export async function getAllSession() {
    return await execCommand(`tmux list-sessions | awk '{print $1}' | sed 's/://'`)
}