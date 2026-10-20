// Svelte/Vite is the only production frontend. Retain this entry for existing tooling.
import { build } from 'vite';
await build();

import {buildDefiantChat} from './build-defiant-chat.js';
await buildDefiantChat();
