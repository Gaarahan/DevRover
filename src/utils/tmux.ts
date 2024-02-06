import { execCommand } from './index';

export function getAllSession() {
    return execCommand(`tmux list-sessions | awk '{print $1}' | sed 's/://'`)
}