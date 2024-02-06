import { execCommand } from './shell';

export function getAllSession() {
    return execCommand(`tmux list-sessions | awk '{print $1}' | sed 's/://'`)
}