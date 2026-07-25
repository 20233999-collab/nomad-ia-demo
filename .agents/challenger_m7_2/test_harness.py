#!/usr/bin/env python3
"""
Adversarial Test Harness for NOMAD-IA Demo Hub Application
Milestone 7 - Challenger 2 (Adversarial Edge Case & Security Tester)
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
import subprocess
import signal

PORT = 3099
BASE_URL = f"http://localhost:{PORT}"

def log(msg, status="INFO"):
    symbol = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️", "INFO": "ℹ️"}.get(status, "ℹ️")
    print(f"[{symbol} {status}] {msg}")

class TestRunner:
    def __init__(self):
        self.results = []
        self.server_proc = None

    def start_server(self):
        env = os.environ.copy()
        env["PORT"] = str(PORT)
        log(f"Starting server.js on port {PORT}...", "INFO")
        self.server_proc = subprocess.Popen(
            ["node", "server.js"],
            cwd="/home/laptop/Documentos/mvp-hackaton-minedu",
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        # Give server time to start
        time.sleep(1.5)
        # Verify server is alive
        if self.server_proc.poll() is not None:
            stdout, stderr = self.server_proc.communicate()
            raise RuntimeError(f"Server failed to start:\nSTDOUT: {stdout}\nSTDERR: {stderr}")
        log("Server started successfully.", "INFO")

    def stop_server(self):
        if self.server_proc and self.server_proc.poll() is None:
            log("Stopping server process...", "INFO")
            self.server_proc.terminate()
            try:
                self.server_proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.server_proc.kill()

    def record_test(self, suite, name, expected, actual, passed, details=""):
        self.results.append({
            "suite": suite,
            "name": name,
            "expected": expected,
            "actual": actual,
            "passed": passed,
            "details": details
        })
        status = "PASS" if passed else "FAIL"
        log(f"[{suite}] {name} => Expected: {expected} | Actual: {actual}", status)
        if not passed and details:
            print(f"    Details: {details}")

    def make_request(self, path, method="GET", headers=None, data=None, is_json=True):
        if headers is None:
            headers = {}
        url = f"{BASE_URL}{path}"
        req = urllib.request.Request(url, method=method)
        
        for k, v in headers.items():
            req.add_header(k, v)

        payload_bytes = None
        if data is not None:
            if is_json and isinstance(data, (dict, list)):
                payload_bytes = json.dumps(data).encode('utf-8')
                if 'Content-Type' not in headers:
                    req.add_header('Content-Type', 'application/json')
            elif isinstance(data, bytes):
                payload_bytes = data
            elif isinstance(data, str):
                payload_bytes = data.encode('utf-8')
        
        try:
            with urllib.request.urlopen(req, data=payload_bytes) as response:
                status_code = response.getcode()
                resp_headers = dict(response.headers)
                resp_body = response.read().decode('utf-8', errors='replace')
                return status_code, resp_headers, resp_body
        except urllib.error.HTTPError as e:
            resp_headers = dict(e.headers)
            resp_body = e.read().decode('utf-8', errors='replace')
            return e.code, resp_headers, resp_body
        except Exception as e:
            return 0, {}, str(e)

    def is_server_responsive(self):
        status, _, _ = self.make_request("/api/telemetry", method="GET")
        return status == 200

    def run_suite_1_edge_cases(self):
        log("\n--- Suite 1: POST /api/telemetry Endpoint Edge Cases ---", "INFO")
        suite = "Suite 1: Endpoint Edge Cases"

        # Valid baseline for reference
        valid_payload = {
            "student_id": "est_base",
            "student_name": "Test Student",
            "game_id": "aprender_ia_steam",
            "time_elapsed_ms": 15000,
            "errors_count": 0,
            "rage_clicks": 0
        }

        # 1.1 Missing student_name
        p = valid_payload.copy()
        del p["student_name"]
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        self.record_test(suite, "Missing student_name", 400, code, code == 400, body)

        # 1.2 Missing game_id
        p = valid_payload.copy()
        del p["game_id"]
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        self.record_test(suite, "Missing game_id", 400, code, code == 400, body)

        # 1.3 Missing time_elapsed_ms
        p = valid_payload.copy()
        del p["time_elapsed_ms"]
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        self.record_test(suite, "Missing time_elapsed_ms", 400, code, code == 400, body)

        # 1.4 Missing errors_count
        p = valid_payload.copy()
        del p["errors_count"]
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        self.record_test(suite, "Missing errors_count", 400, code, code == 400, body)

        # 1.5 Invalid data type: non-numeric string for time_elapsed_ms
        p = valid_payload.copy()
        p["time_elapsed_ms"] = "not_a_number"
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        self.record_test(suite, "Invalid type (string 'not_a_number' for time_elapsed_ms)", 400, code, code == 400, body)

        # 1.6 Invalid data type: non-numeric string for errors_count
        p = valid_payload.copy()
        p["errors_count"] = "invalid_err"
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        self.record_test(suite, "Invalid type (string 'invalid_err' for errors_count)", 400, code, code == 400, body)

        # 1.7 Negative elapsed time (-100ms)
        p = valid_payload.copy()
        p["time_elapsed_ms"] = -100
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        # Should return 400 Bad Request
        self.record_test(suite, "Negative time_elapsed_ms (-100)", 400, code, code == 400, f"Body: {body}")

        # 1.8 Empty JSON payload {}
        code, _, body = self.make_request("/api/telemetry", method="POST", data={})
        self.record_test(suite, "Empty JSON payload ({})", 400, code, code == 400, body)

        # 1.9 Oversized payload (>100KB)
        large_string = "A" * 120000 # ~120KB
        p = valid_payload.copy()
        p["student_name"] = large_string
        code, _, body = self.make_request("/api/telemetry", method="POST", data=p)
        # Expect 400 or 413, without crashing server
        responsive = self.is_server_responsive()
        passed = (code in (400, 413)) and responsive
        self.record_test(suite, "Oversized body (~120KB)", "400 or 413 & Server Alive", f"{code} & Server Alive={responsive}", passed, f"Status: {code}, Body: {body[:200]}")

    def run_suite_2_http_cors(self):
        log("\n--- Suite 2: HTTP Methods & CORS ---", "INFO")
        suite = "Suite 2: HTTP Methods & CORS"

        # 2.1 OPTIONS preflight request
        headers = {
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
        code, resp_headers, body = self.make_request("/api/telemetry", method="OPTIONS", headers=headers)
        has_cors_origin = "access-control-allow-origin" in resp_headers or "Access-Control-Allow-Origin" in resp_headers
        passed = (code in (200, 204)) and has_cors_origin
        self.record_test(suite, "OPTIONS Preflight /api/telemetry", "200/204 with CORS header", f"Code {code}, CORS Header Present: {has_cors_origin}", passed, f"Headers: {resp_headers}")

        # 2.2 GET non-existent API endpoint /api/nonexistent
        code, _, body = self.make_request("/api/nonexistent", method="GET")
        try:
            body_json = json.loads(body)
            is_404_json = (code == 404) and (body_json.get("success") == False)
        except Exception:
            is_404_json = False
        self.record_test(suite, "GET /api/nonexistent 404 JSON", "404 JSON", f"Code {code}, Body: {body}", is_404_json)

        # 2.3 POST non-existent API endpoint /api/unknown
        code, _, body = self.make_request("/api/unknown", method="POST", data={"foo": "bar"})
        try:
            body_json = json.loads(body)
            is_404_json = (code == 404) and (body_json.get("success") == False)
        except Exception:
            is_404_json = False
        self.record_test(suite, "POST /api/unknown 404 JSON", "404 JSON", f"Code {code}, Body: {body}", is_404_json)

    def run_suite_3_semaforo_boundaries(self):
        log("\n--- Suite 3: Telemetry Semáforo Boundaries ---", "INFO")
        suite = "Suite 3: Semáforo Boundaries"

        test_cases = [
            # (name, time_elapsed_ms, errors_count, rage_clicks, expected_semaforo)
            ("19999ms boundary (VERDE)", 19999, 0, 0, "VERDE"),
            ("20000ms boundary (AMARILLO)", 20000, 0, 0, "AMARILLO"),
            ("40000ms boundary (AMARILLO)", 40000, 0, 0, "AMARILLO"),
            ("40001ms boundary (ROJO)", 40001, 0, 0, "ROJO"),
            ("rage_clicks 2 vs 3: rage_clicks=2", 10000, 0, 2, "AMARILLO"),
            ("rage_clicks 2 vs 3: rage_clicks=3", 10000, 0, 3, "ROJO"),
        ]

        for name, time_ms, errors, rage, expected in test_cases:
            payload = {
                "student_id": f"est_boundary_{time_ms}_{rage}",
                "student_name": "Boundary Tester",
                "game_id": "aprender_ia_steam",
                "time_elapsed_ms": time_ms,
                "errors_count": errors,
                "rage_clicks": rage
            }
            code, _, body = self.make_request("/api/telemetry", method="POST", data=payload)
            actual_semaforo = "UNKNOWN"
            if code == 200:
                try:
                    data = json.loads(body)
                    actual_semaforo = data.get("data", {}).get("semaforo")
                except Exception as e:
                    actual_semaforo = f"JSON Parse Error: {e}"
            else:
                actual_semaforo = f"HTTP {code}"

            passed = (actual_semaforo == expected)
            self.record_test(suite, name, expected, actual_semaforo, passed, f"Payload: time={time_ms}, errors={errors}, rage={rage}")

    def run_suite_4_static_files(self):
        log("\n--- Suite 4: Frontend Static File Serving ---", "INFO")
        suite = "Suite 4: Static File Serving"

        files = [
            ("/styles/mondrian.css", "text/css"),
            ("/aprender-ia/game.js", ["application/javascript", "text/javascript"]),
            ("/educar-ia/dashboard.js", ["application/javascript", "text/javascript"]),
            ("/index.html", "text/html"),
        ]

        for path, expected_mime in files:
            code, resp_headers, body = self.make_request(path, method="GET")
            content_type = resp_headers.get("content-type", resp_headers.get("Content-Type", ""))
            
            if isinstance(expected_mime, list):
                mime_passed = any(m in content_type.lower() for m in expected_mime)
            else:
                mime_passed = expected_mime in content_type.lower()

            passed = (code == 200) and mime_passed
            actual_desc = f"Code: {code}, Content-Type: {content_type}"
            self.record_test(suite, f"Static File: {path}", f"200 OK & {expected_mime}", actual_desc, passed)

    def run_all(self):
        self.start_server()
        try:
            self.run_suite_1_edge_cases()
            self.run_suite_2_http_cors()
            self.run_suite_3_semaforo_boundaries()
            self.run_suite_4_static_files()
        finally:
            self.stop_server()

        # Summary
        total = len(self.results)
        passed_count = sum(1 for r in self.results if r["passed"])
        failed_count = total - passed_count

        log(f"\n==================================================", "INFO")
        log(f"TEST HARNESS SUMMARY: Total={total}, Passed={passed_count}, Failed={failed_count}", "INFO")
        log(f"==================================================\n", "INFO")

        return passed_count, failed_count

if __name__ == "__main__":
    runner = TestRunner()
    passed, failed = runner.run_all()
    sys.exit(0 if failed == 0 else 1)
