let ctx: AudioContext;

export function play_sound(freq: number, duration: number, type: OscillatorType = "square") {
    if (!ctx) ctx = new AudioContext();
    let o = ctx.createOscillator();
    let g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);
}
