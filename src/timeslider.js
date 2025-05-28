import { getState, StateKeys } from "./state.js";

export function initializeTimeSlider(containerId, onChangeCallback) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const radarTimeDisplay = document.getElementById("radartime");

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "100";
  slider.className = "time-slider";
  container.appendChild(slider);
  const handle = document.createElement("div");
  handle.id = "custom-handle";
  handle.className = "ui-slider-handle";
  container.appendChild(handle);

  const updateHandlePosition = () => {
    const percent =
      ((parseFloat(slider.value) - parseFloat(slider.min)) /
        (parseFloat(slider.max) - parseFloat(slider.min))) *
      100;
    handle.style.left = `${percent}%`;
  };

  const updateTimeDisplay = (value) => {
    const sts = getState(StateKeys.STS);
    const ets = getState(StateKeys.ETS);
    if (!(sts instanceof Date) || !(ets instanceof Date)) {
      console.error("Invalid start or end time in state:", sts, ets);
      return;
    }
    const increment = (ets.getTime() - sts.getTime()) / 1000 / 60 / 100; // minutes
    const minutes = Math.floor(increment * value);
    const newDate = new Date(sts.getTime() + minutes * 60 * 1000);
    // Rectify newDate to nearest 5 minutes
    const dt = new Date(newDate);
    dt.setUTCSeconds(0);
    dt.setUTCMilliseconds(0);
    dt.setUTCMinutes(Math.round(dt.getUTCMinutes() / 5) * 5);
    onChangeCallback(dt);
    const timeStr = dt.toLocaleString();
    if (radarTimeDisplay) {
      radarTimeDisplay.textContent = timeStr;
    }
  };

  slider.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      console.error("Event target is not an HTMLInputElement:", target);
      return;
    }
    const value = parseInt(target.value, 10);
    updateHandlePosition();
    updateTimeDisplay(value);
  });

  // Initialize display
  updateHandlePosition();
  updateTimeDisplay(100);
}
