import { mount } from "svelte";
import CalendarHarness from "./CalendarHarness.svelte";
import "../../src/studio.css";
mount(CalendarHarness, { target: document.getElementById("calendar-fixture") });
