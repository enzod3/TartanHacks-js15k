// Test song — dark zombie loop (ZzFXM format)
// [instruments, patterns, sequence, bpm]
export const SONG: any[] = [
    // Instruments
    [
        [1.0, 0, 65, , .5, .3, 2, 2.5, , , , , , .2, , , .04, .6],    // 0: Dark bass
        [1.5, 0, 200, , .15, .25, 0, 1, , , , , , , , , , .4],         // 1: Eerie pad
    ],
    // Patterns
    [
        // Pattern 0: Bass intro
        [
            // Bass: C2, rest, G1, rest, Ab1, rest, Bb1, rest
            [0, 0, 13, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 11, 0, 0, 0],
        ],
        // Pattern 1: Bass + pad
        [
            [0, 0, 13, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 11, 0, 0, 0],
            [1, 0, 25, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 20, 0, 0, 0],
        ],
        // Pattern 2: Bass + pad (denser)
        [
            [0, 0, 13, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 11, 0, 0, 0],
            [1, 0, 25, 0, 0, 28, 0, 0, 20, 0, 0, 0, 18, 0, 0, 0, 0, 0],
        ],
    ],
    // Sequence
    [0, 0, 1, 1, 2, 2, 1, 2],
    // BPM
    100,
];
