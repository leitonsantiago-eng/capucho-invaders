#!/usr/bin/env python3
"""Servidor HTTP local portable para jugar Capucho Invaders sin conexión a internet."""

import functools
import http.server
import os
import socket
import threading
import webbrowser


def find_free_port(start_port: int = 8000, max_tries: int = 25) -> int:
    for port in range(start_port, start_port + max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return 0


def main() -> None:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    port = find_free_port(8000)
    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler,
        directory=base_dir,
    )
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    actual_port = server.server_address[1]
    url = f"http://127.0.0.1:{actual_port}/index.html"

    print("============================================================")
    print("  CAPUCHO INVADERS: RESISTENCIA EN MELENDEZ (Modo Offline)  ")
    print("============================================================")
    print(f"  Servidor activo en: {url}")
    print("  Cierra esta ventana o presiona Ctrl+C para salir.")
    print("============================================================")

    threading.Timer(0.6, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nCerrando servidor local...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
