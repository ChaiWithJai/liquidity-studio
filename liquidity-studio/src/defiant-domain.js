import {mount} from 'svelte';
import DefiantDomainApp from './components/defiant/DefiantDomainApp.svelte';
import './app-chrome.css';
mount(DefiantDomainApp,{target:document.getElementById('defiant-domain')});
