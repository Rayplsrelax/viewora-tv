import { describe, expect, it } from "vitest";

describe("Environment secrets validation", () => {
  it("XTREAM_API_KEY is set and has expected format", () => {
    const key = process.env.XTREAM_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("XTREAM_API_URL is set and is a valid URL", () => {
    const url = process.env.XTREAM_API_URL;
    expect(url).toBeDefined();
    expect(url).toContain("https://");
    expect(url).toContain("8k.cms-only.ru");
  });

  it("XTREAM_PACKAGE_ID is set", () => {
    const id = process.env.XTREAM_PACKAGE_ID;
    expect(id).toBeDefined();
    expect(id).toBe("26826");
  });

  it("SMTP_HOST is set", () => {
    const host = process.env.SMTP_HOST;
    expect(host).toBeDefined();
    expect(host).toContain("smtp");
  });

  it("SMTP_PORT is set to 587", () => {
    const port = process.env.SMTP_PORT;
    expect(port).toBeDefined();
    expect(port).toBe("587");
  });

  it("SMTP_USER is set to the business email", () => {
    const user = process.env.SMTP_USER;
    expect(user).toBeDefined();
    expect(user).toContain("@rayallcompany.business");
  });

  it("SMTP_PASS is set", () => {
    const pass = process.env.SMTP_PASS;
    expect(pass).toBeDefined();
    expect(pass!.length).toBeGreaterThan(0);
  });
});
