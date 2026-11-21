import { planCar } from "@/lib/gta6/traffic";

type CarClasses = { runner: string; car: string; head: string; tail: string };

/**
 * Sends cars across the bridge's lane, one element per car, each removed when
 * its crossing ends. Waits while the tab is hidden and picks up again when it
 * is shown. Returns the stop function, which also clears the lane.
 */
export function startTraffic(lane: HTMLElement, cls: CarClasses): () => void {
  let timer = 0;

  const spawn = () => {
    const plan = planCar(Math.random);
    const runner = document.createElement("div");
    runner.className = cls.runner;
    runner.dataset.dir = plan.ltr ? "ltr" : "rtl";
    runner.style.setProperty("--d", `${plan.seconds.toFixed(1)}s`);
    const car = document.createElement("div");
    car.className = cls.car;
    car.style.background = plan.colour;
    const head = document.createElement("i");
    head.className = cls.head;
    const tail = document.createElement("i");
    tail.className = cls.tail;
    car.append(head, tail);
    runner.append(car);
    runner.addEventListener("animationend", () => runner.remove(), { once: true });
    lane.append(runner);
    timer = window.setTimeout(spawn, plan.gapMs);
  };

  const onVisibility = () => {
    window.clearTimeout(timer);
    if (!document.hidden) spawn();
  };

  document.addEventListener("visibilitychange", onVisibility);
  if (!document.hidden) spawn();

  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
    lane.replaceChildren();
  };
}
