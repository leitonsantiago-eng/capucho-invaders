#!/usr/bin/env python3
"""Script de despliegue automático a GitHub para Capucho Invaders."""

import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_URL = "https://github.com/leitonsantiago-eng/capucho-invaders.git"


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    print(f"> {' '.join(cmd)}")
    return subprocess.run(cmd, cwd=BASE_DIR, check=check)


def main() -> None:
    if not os.path.isdir(os.path.join(BASE_DIR, ".git")):
        run(["git", "init"])

    run(["git", "config", "user.name", "Santiago"])
    run(["git", "config", "user.email", "leiton.santiago@correounivalle.edu.co"])

    run(["git", "add", "-A"])

    status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=BASE_DIR,
        capture_output=True,
        text=True,
        check=True,
    )
    if status.stdout.strip():
        msg = sys.argv[1] if len(sys.argv) > 1 else "chore: actualizacion automatica Capucho Invaders"
        run(["git", "commit", "-m", msg])
    else:
        print("No hay cambios pendientes para commit.")

    run(["git", "branch", "-M", "main"])

    remotes = subprocess.run(
        ["git", "remote"],
        cwd=BASE_DIR,
        capture_output=True,
        text=True,
        check=True,
    ).stdout.splitlines()

    if "origin" not in remotes:
        run(["git", "remote", "add", "origin", REPO_URL])

    token = os.environ.get("GITHUB_TOKEN")
    push_target = (
        f"https://leitonsantiago-eng:{token}@github.com/leitonsantiago-eng/capucho-invaders.git"
        if token
        else "origin"
    )

    run(["git", "push", "-u", push_target, "main"])
    run(["git", "push", push_target, "--tags"])
    print("[OK] Codigo subido exitosamente a la rama main.")


if __name__ == "__main__":
    main()
