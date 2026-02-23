# ZomBEACH

Defend a beach island from waves of zombies using rifles, shotguns, rock throwers, and grenades. Survive all 4 waves, upgrade your weapons, and escape.

**[Play here](https://enzod3.github.io/TartanHacks-js15k/)**

Built for [TartanHacks](https://tartanhacks.com/) using [Goodluck](https://github.com/piesku/goodluck), a hackable ECS framework for making small and fast browser games.

## Controls

- **Left side** of screen: move (virtual joystick)
- **Right side** of screen: look (pan)
- **Tap** to shoot
- Collect blue orbs for 3rd person mode

## Gameplay

- 4 waves of increasingly fast and tough zombies
- Choose weapon upgrades between waves (Rock Thrower, Shotgun, Grenade, damage/fire rate boosts)
- Reach the evac ladder after wave 4 to win

## Running Locally

    npm install
    npm start

Then open http://localhost:1234 in the browser.

## Building

    make -C play

Creates `play/index.html` with all resources inlined. To build the ZIP:

    make -C play index.zip
