import { mount } from 'svelte';
import NativeEditorHarness from './NativeEditorHarness.svelte';
mount(NativeEditorHarness, { target: document.getElementById('native-host') });
