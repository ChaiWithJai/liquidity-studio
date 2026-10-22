// Svelte/Vite is the only production frontend. Retain this entry for existing tooling.
import { build } from 'vite';
await build();

import {buildDefiantChat} from './build-defiant-chat.js';
await buildDefiantChat();

import {buildDefiantStdio} from './build-defiant-stdio.js';
await buildDefiantStdio();

import {buildDefiantSynthetic} from './build-defiant-synthetic.js';
await buildDefiantSynthetic();

import {buildDefiantDomain} from './build-defiant-domain.js';
await buildDefiantDomain();
import {buildDefiantDemoServer} from './build-defiant-demo-server.js';
await buildDefiantDemoServer();

import {buildDefiantEvidenceStdio} from './build-defiant-stdio.js';
await buildDefiantEvidenceStdio();
