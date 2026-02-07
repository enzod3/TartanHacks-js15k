// ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.2 by Frank Force
let ctx: AudioContext;
let zzfxV = .3;
let zzfxR = 44100;

function ensure_ctx() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
}

function zzfxG(
    p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0,N=0
): number[] {
    let M=Math,d=2*M.PI,R=zzfxR,G=u*=500*d/R/R;k=[] as any;let C=b*=(1-k+2*k*M.random())*d/R,
    g=0,H=0,a=0,n=1,I=0,J=0,f=0,s=0,h=N<0?-1:1,x=d*h*N*2/R,L=M.cos(x),Z=M.sin,K=Z(x)/4,
    O=1+K,X=-2*L/O,Y=(1-K)/O,P=(1+h*L)/2/O,Q=-(h+L)/O,S=P,T=0,U=0,V=0,W=0;
    e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;p*=zzfxV;
    for(h=e+m+r+t+c|0;a<h;(k as any)[a++]=f*p)
        ++J%(100*F|0)||(
            f=q?1<q?2<q?3<q?4<q?+(g/d%1<D/2)*2-1:Z(g**3):M.max(M.min(M.tan(g),1),-1)
            :1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):Z(g),
            f=(l?1-B+B*Z(d*a/l):1)*(4<q?s:(f<0?-1:1)*M.abs(f)**D)*
            (a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),
            f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*(k as any)[a-c|0]/2/p):f,
            N?f=W=S*T+Q*(T=U)+P*(U=f)-Y*V-X*(V=W):0
        ),
        x=(b+=u+=y)*M.cos(A*H++),g+=x+x*E*Z(a**5),n&&++n>z&&(b+=v,C+=v,n=0),
        !l||++I%l||(b=C,u=G,n=n||1);
    return k as any;
}

function zzfx(
    p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0,N=0
) {
    ensure_ctx();
    let samples = zzfxG(p,k,b,e,r,t,q,D,u,y,v,z,l,E,A,F,c,w,m,B,N);
    let buf = ctx.createBuffer(1, samples.length, zzfxR);
    buf.getChannelData(0).set(samples);
    let src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
}

function zzfxP(...t: number[][]) {
    ensure_ctx();
    let e = ctx.createBufferSource();
    let f = ctx.createBuffer(t.length, t[0].length, zzfxR);
    t.map((d, i) => f.getChannelData(i).set(d));
    e.buffer = f;
    e.connect(ctx.destination);
    e.start();
    return e;
}

// Expose globals needed by zzfxm.min.js.
(window as any).zzfxG = zzfxG;
(window as any).zzfxR = zzfxR;

// ZzFXM (v2.0.3) | (C) Keith Clark | MIT
// Side-effect import — sets window.zzfxM.
import "./zzfxm.min.js";
declare var zzfxM: (...args: any[]) => number[][];

// --- Music playback ---
let music_node: AudioBufferSourceNode | null = null;
let music_gain: GainNode | null = null;

export function play_music(song: any[], loop = true) {
    ensure_ctx();
    stop_music();
    let data = zzfxM(...song);
    music_gain = ctx.createGain();
    music_gain.gain.value = 3;
    music_gain.connect(ctx.destination);
    let e = ctx.createBufferSource();
    let f = ctx.createBuffer(data.length, data[0].length, zzfxR);
    data.map((d: number[], i: number) => f.getChannelData(i).set(d));
    e.buffer = f;
    e.connect(music_gain);
    e.loop = loop;
    e.start();
    music_node = e;
    return music_node;
}

export function stop_music() {
    if (music_node) {
        music_node.stop();
        music_node = null;
    }
}

// --- SFX ---
export function play_gunshot(rate: number = 1) {
    zzfx(2.1, undefined, 350 * rate, .03, .08, .07, undefined, 1.7, 20, 35, undefined, undefined, undefined, .7, undefined, .4, .24, .87, .08);
}

export function play_hit() {
    zzfx(2.1, undefined, 401, undefined, .04, .002, undefined, 2.3, undefined, 2, undefined, undefined, undefined, 1.4, 9.6, .3, .16, .72, .05);
}

export function play_kill() {
    zzfx(2, undefined, 683, .01, .03, .16, 2, 1.2, -5, 37.1, -17, .24, undefined, .6, 244, undefined, .39, .83, .17, .01);
}

export function play_hurt() {
    zzfx(.7, undefined, 459, .02, .05, .12, 3, 2.1, undefined, undefined, undefined, undefined, undefined, 1.3, undefined, .1, undefined, .73, .07, undefined, 1454);
}

export function play_pickup() {
    zzfx(.4, undefined, 366, .02, .19, .19, undefined, .6, 3, undefined, 343, .2, undefined, undefined, undefined, undefined, undefined, .94, .25, undefined, 280);
}
