# Builder Module

This module provides a set of commands used for in-game world building.

## Installation
To install:

- Log into your MUD with an admin account.
- Access the administrative menu via the 'arch' command.
- Select modules
- Select 'e' to enable a module
- Select Builder from the list of available modules.
- Confirm that this module should be enabled.
- Restart your mud. The builder commands should now be available.

## Usage

To use the builder commands you must be logged in as a character with the BUILDER permission.

## Commands

World building:

- dig: create a new room linked to the room you are in.
- door: add a door between rooms.
- link: add a one way exit from the room you are in to another room.
- unlink: remove an exit from the room you are in.
- edit room <property>: change a property of the room you are in (properties: name, desc, flags)

Items:

- create item: create a new item type
- conjure: create an instance of an item

Mobiles:

- create mob: create a new mob type
- placemob: place a mob in the current room.

