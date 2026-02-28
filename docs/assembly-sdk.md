# Assembly SDK — PRD Summary (Draft)

This document is a temporary summary of key decisions and scope. A full PRD will be generated later using ChatGPT or Claude.

## Goal

Create and publish a new npm package that recreates the core client functionality of `@assembly-js/node-sdk`, focusing only on the foundational transport layer.

## Scope (v0)

Core features to implement:

- `createClient()` entry point
- Typed HTTP request layer
- Authentication via API key
- Pagination helper (AsyncIterable)
- Stable error model
- Minimal, reusable transport layer

Out of scope for now:

- Full resource modules
- Browser support
- OpenAPI codegen

## Technical Decisions

Runtime and packaging:

- ESM-only package
- TypeScript-first
- Node 18+ or 20+
- Publish to npm

Tooling:

- Bun for package management
- Bun for build
- Bun for tests
- Ultracite for formatting
- OXC parser
- Oxlint for linting

Bundling:

- Prefer `bun build`
- Alternative options: bunup or vite (if needed later)

## Architecture Direction

Core layers:

- Client factory (`createClient`)
- Request transport layer
- Error abstraction layer
- Pagination helper

Future extensions:

- Resource modules built on top of core client
- Additional utilities and helpers

## Packaging Requirements

- ESM-only output
- Export map in package.json
- Type definitions included
- Minimal dependencies

## Next Steps

- Scaffold project structure
- Implement client factory
- Implement request layer
- Implement error model
- Implement pagination helper
- Configure build and lint tooling
- Publish initial version

## PRD Generation (Future)

This summary will later be expanded into a full PRD including:

- Detailed requirements
- Data flow
- API design
- File structure
- Rollout plan

Let's use https://www.npmjs.com/package/ky for making requests with retry mechanism with max retry of 2. Since the assemnbly api has max imit of 20 requests per second. We might also want to introduce bottlenect of some sort if possible. So that there are no more than 20 requests in a second.

Assembly api also uses api key and token. The limit is based on the workspace. And we get the workspace based on the token. The app get token in this way.

Assembly api is a SaaS.
Companies or User that purchase the service get their dashboard (Workspace).
For each workspace they get can add other users and companies. And they can create a custom app
This is documented here: https://docs.assembly.com/docs/custom-apps-developing-your-first-app
And these apps are loaded as an iframe. For these, we in an iframe token is provided as query parameter which assembly sdk parses to get details which also includes current workspace.

And assembly sdk is also used to make requests to various apis that assembly provides.
These apis are documented here. https://docs.assembly.com/reference/getting-started-introduction

I want to recreate this sdk. Make it more robust and usable. And I also want to export types for the assembly.

I also want implement app bridge:
This is basically a system that facilitates adding some UI's in assembly dashboard, from within an iframe using post message:
/Users/anitshrestha/workspace/assembly/client-home/src/features/app-bridge
We have been repeating this work in every repos or app we have created. So I want to facilitate this better.

I also want to add and export types related to assembly:
/Users/anitshrestha/workspace/assembly/client-home/src/lib/assembly
But I want to refactor this somewhat. I want to create base schema eg. CompanySchema, Client Schema, etc. And then use them to create response schema.
If any requests require specific payload. I want zod schema and types for those as well.

There's similiar implementaion in this path as well: /Users/anitshrestha/workspace/assembly/xero-integration/src/lib/copilot

But if we are using bottlenect I want to ensure that it will not unnecessarily set the minTime of requests to 55ms or something if possible. If there are better alternative to bottlenect, then I would prefer that.

Note:- All the npm packages we use should be well maintained.

I think for errors we can refer to /Users/anitshrestha/workspace/mother-games/dashboard/src/features/common/errors
I like implementation there better. We can create new assembly specific error classes based on these like we are doing in xero-integration.

Another thing though. Right now We are usually create a class liek CopilotApi or AssemblyApi which absolutely requires token and throws error if token is not there.
But it should be clear from the sdk that not every endpoint requires token. So I want a separate function to parse token or validate token than if is valid returns the token payload.
And for each endpoint that requires token. It checks the presence of token and if not found it should throw appropriate error.

And there's concept of internal user and client user. I want to add a function in our new sdk to validate against it and throw error. eg. ensureIsClient and ensureIsInternalUser, etc.

Additionally we want to provide some optinos to our new sdk constructor to customie the behavior. eg retrycount, and other sensible retry behavior. bottleneck behaviors if required. flag to turn on and off the zod schema check on response of the payload.

Some app can be a market place app which usually have isngle api key and installed in multiple workspace. While some are custom apps that is usually installed in a single workspace.
We want to facilitate both. And also if deployed on something like vercel with compute engine, we want to prevent sharing of our sdk instance in between requests.
Everything must be properly documented. We also want to write tests using bun without actually make the final call to assembly because of their api limit.

And also sometimes even in single app we could be using multiple api keys. IDeally this should be facilitate by creating multiple instances of our assembly kit sdk.
Also this might be worth checking out. https://docs.assembly.com/reference/getting-started-introduction#rate-limits
