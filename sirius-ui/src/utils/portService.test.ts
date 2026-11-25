import assert from "node:assert/strict";
import { test } from "node:test";
import { combinePortServices, compactPortService, formatPortService, serviceName } from "./portService";

test("formats port, protocol and service from structured fields", () => {
  assert.equal(
    formatPortService({ port: 8080, protocol: "TCP", serviceInfo: "http (Apache Tomcat 8.5.19)" }),
    "8080/tcp · http (Apache Tomcat 8.5.19)",
  );
  assert.equal(formatPortService({ port: 8080, protocol: "tcp", serviceInfo: "http" }), "8080/tcp · http");
  assert.equal(formatPortService({ port: 8080, protocol: "tcp" }), "8080/tcp");
  assert.equal(formatPortService({ port: 22, serviceInfo: "OpenSSH 10.0p2" }), "22 · OpenSSH 10.0p2");
  assert.equal(formatPortService({ serviceInfo: "ssh" }), "ssh");
  assert.equal(formatPortService({ fallback: "apache http_server 2.4.49" }), "apache http_server 2.4.49");
  assert.equal(formatPortService({ port: 80, serviceInfo: " ", fallback: "apache" }), "80 · apache");
  assert.equal(formatPortService({ port: 0, protocol: "tcp", serviceInfo: "unknown" }), undefined);
  assert.equal(formatPortService({}), undefined);
});

test("service name drops the parenthesised product detail", () => {
  assert.equal(serviceName("http (Apache Tomcat 8.5.19)"), "http");
  assert.equal(serviceName(" ssh (OpenSSH 10.0p2 Debian 7+deb13u4) "), "ssh");
  assert.equal(serviceName("Apache httpd 2.4.49"), "Apache httpd 2.4.49");
  assert.equal(serviceName("(tcpwrapped)"), "(tcpwrapped)");
});

test("compacts a port/service label at a word boundary", () => {
  assert.equal(compactPortService("8080 · http (Apache Tomcat 8.5.19)"), "8080 · http");
  assert.equal(compactPortService("22 · ssh (OpenSSH 10.0p2 Debian 7+deb13u4)"), "22 · ssh");
  assert.equal(compactPortService("8080/tcp · http (Apache Tomcat 8.5.19)"), "8080/tcp · http");
  assert.equal(compactPortService("80/tcp · Apache httpd 2.4.25"), "80/tcp · Apache httpd 2.4.25");
  assert.equal(compactPortService("8080/tcp"), "8080/tcp");
  assert.equal(compactPortService("ssh (OpenSSH 10.0p2)"), "ssh");
  assert.equal(compactPortService("apache http_server 2.4.49"), "apache http_server 2.4.49");
});

test("combines one CVE's port/service across hosts", () => {
  assert.deepEqual(combinePortServices([]), {});
  assert.deepEqual(
    combinePortServices([
      ["192.168.123.12", "80/tcp · Apache httpd 2.4.25"],
      ["192.168.123.13", "80/tcp · Apache httpd 2.4.25"],
    ]),
    { label: "80/tcp · Apache httpd 2.4.25" },
  );
  // One label: the compact form, the full one as its tooltip.
  assert.deepEqual(
    combinePortServices([
      ["192.168.123.12", "8080/tcp · http (Apache Tomcat 8.5.19)"],
      ["192.168.123.14", "8080/tcp · http (Apache Tomcat 8.5.19)"],
    ]),
    { label: "8080/tcp · http", detail: "8080/tcp · http (Apache Tomcat 8.5.19)" },
  );
  assert.deepEqual(
    combinePortServices([
      ["192.168.123.12", "80/tcp · Apache httpd 2.2.22"],
      ["192.168.123.13", "80/tcp · Apache httpd 2.4.25"],
      ["192.168.123.14", undefined],
    ]),
    {
      label: "80/tcp · 2 versions",
      detail: "192.168.123.12: 80/tcp · Apache httpd 2.2.22\n192.168.123.13: 80/tcp · Apache httpd 2.4.25",
    },
  );
  assert.deepEqual(
    combinePortServices([
      ["a", "80/tcp · Apache httpd 2.2.22"],
      ["b", "8080/tcp · http"],
    ]),
    { label: "2 services", detail: "a: 80/tcp · Apache httpd 2.2.22\nb: 8080/tcp · http" },
  );
});
