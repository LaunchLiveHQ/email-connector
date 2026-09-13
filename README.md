# Email Connector — Open Source SDK & Embeddable UI

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-%40emailconnector%2Fsdk-emerald)](https://www.npmjs.com/package/@emailconnector/sdk)
[![Canonical Domain](https://img.shields.io/badge/Domain-email--connector.com-10B981)](https://email-connector.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

**The open-source, zero-trust transactional email failover balancer and embeddable UI control plane for modern applications.**

Stack 5+ free email tiers to dispatch **~24,000 free transactional emails every month (~800/day)** with zero data egress, zero vendor lock-in, and automatic priority cascading across Resend, Brevo, Mailjet, MailerSend, and SendGrid.

---

## 🌟 Why Email Connector?

1. **Stack ~24,000 Free Emails / Month**: By cascading Tier-1 provider free allowances (Brevo 300/day, Mailjet 200/day, Resend 100/day, SendGrid 100/day, MailerSend 100/day), your application gets enterprise-grade volume for $0/mo.
2. **Mode A Zero-Trust Runtime**: Your API keys and email message bodies remain strictly in-process memory on your servers. Zero email data or credentials pass through any external intermediary relay.
3. **Priority Cascading (1 to 5)**: Automatically routes to backup providers on HTTP 429 rate limits, quota exhaustion, 5xx server errors, or connection timeouts.
4. **Drop-in Embeddable UI**: Drop an enterprise-grade "Sending Servers" management screen directly into your SaaS using `@emailconnector/react`.

---

## 📦 Packages in this Repository

| Package | Version | Description |
| :--- | :--- | :--- |
| **[`@emailconnector/sdk`](packages/sdk)** | `1.0.0` | In-process Zero-Trust load-balancer, token bucket rate limiter, and 25+ ESP drivers. |
| **[`@emailconnector/react`](packages/react)** | `1.0.0` | Embeddable React sending server management tables, live quota gauges, and add server modals. |
| **[`@emailconnector/config-schema`](packages/config-schema)** | `1.0.0` | Shared Zod schemas, validation contracts, and TypeScript types. |

---

## 🚀 Quickstart: Zero-Trust SDK (`@emailconnector/sdk`)

### 1. Installation

#### Option A: Direct from GitHub (Works Today — No npm registry wait!)
Install and use `@emailconnector/sdk` directly from GitHub today without waiting for npm publication:

```bash
# Direct install from GitHub (automatically links as @emailconnector/sdk)
npm install git+https://github.com/LaunchLiveHQ/email-connector.git
```

*Or explicitly named:*
```bash
npm install @emailconnector/sdk@git+https://github.com/LaunchLiveHQ/email-connector.git
```

With other package managers:
```bash
# pnpm
pnpm add @emailconnector/sdk@git+https://github.com/LaunchLiveHQ/email-connector.git

# Yarn
yarn add @emailconnector/sdk@git+https://github.com/LaunchLiveHQ/email-connector.git

# Bun
bun add @emailconnector/sdk@git+https://github.com/LaunchLiveHQ/email-connector.git
```

#### Option B: Standard npm Registry (When published)
```bash
npm install @emailconnector/sdk
```

### 2. Configuration & Sending
```typescript
import { ZeroTrustBalancer } from "@emailconnector/sdk";

// Configure your sending servers in priority order (1 to 5)
const balancer = new ZeroTrustBalancer({
  servers: [
    {
      id: "resend-primary",
      provider: "resend",
      apiKey: process.env.RESEND_API_KEY!,
      priority: 1,
      dailyLimit: 100,
      status: "active",
    },
    {
      id: "brevo-fallback",
      provider: "brevo",
      apiKey: process.env.BREVO_API_KEY!,
      priority: 2,
      dailyLimit: 300,
      status: "active",
    },
    {
      id: "mailjet-backup",
      provider: "mailjet",
      apiKey: process.env.MAILJET_API_KEY!,
      apiSecret: process.env.MAILJET_API_SECRET!,
      priority: 3,
      dailyLimit: 200,
      status: "active",
    },
  ],
});

// Dispatches directly via Resend.
// If Resend hits 100 emails/day or returns 429, automatically fails over to Brevo!
const response = await balancer.sendEmail({
  from: "notifications@yourdomain.com",
  to: "customer@example.com",
  subject: "Your Order Confirmation #8201",
  html: "<p>Thank you for your order!</p>",
  text: "Thank you for your order!",
});

console.log(`Dispatched via: ${response.provider} (Status: ${response.status})`);
```

---

## 🎨 Embeddable UI Component: (`@emailconnector/react`)

Drop an enterprise-grade Sending Servers control plane into your SaaS settings screen in seconds:

```bash
# npm registry (when published)
npm install @emailconnector/react
```

> **Note for Direct GitHub Install:** If you installed via `git+https://github.com/LaunchLiveHQ/email-connector.git`, you can import all components directly from `@emailconnector/sdk/react` without a separate package installation!


```tsx
"use client";

import React, { useState } from "react";
import {
  EmailConnectionProvider,
  SendingServersTable,
  AddServerModal,
  QuotaGaugeCard,
} from "@emailconnector/react";

export default function EmailSettingsScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <EmailConnectionProvider>
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email Routing & Failover</h1>
            <p className="text-sm text-slate-500">Configure zero-trust priority cascades and monitor daily caps.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
          >
            + Connect Server
          </button>
        </div>

        {/* Live Pooled Quota Gauge */}
        <QuotaGaugeCard />

        {/* Interactive Priority Management Table */}
        <SendingServersTable />

        {/* Add Server Modal with Pre-flight Connection Testing */}
        <AddServerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </EmailConnectionProvider>
  );
}
```

---

## 📊 Supported Drivers & Providers

- **Core Freemium Pool**: Resend, Brevo (Sendinblue), Mailjet, MailerSend, Twilio SendGrid
- **Enterprise & Cloud**: Amazon SES, Postmark, ZeptoMail (Zoho), Cloudflare Email Routing
- **Universal Standards**: Standard SMTP / TLS

---

## 📄 License

This open-source repository is licensed under the **Apache License, Version 2.0** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Maintained with ❤️ by <a href="https://github.com/LaunchLiveHQ">LaunchLiveHQ</a> • Platform & Marketplace: <a href="https://email-connector.com">email-connector.com</a>
</p>
