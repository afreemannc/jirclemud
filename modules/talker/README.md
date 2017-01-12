# Talker Module

This module provides a new "talker" item and commands to interact with it.

On the Discworld MUD a talker is required to access group chats. It functions much like a two way radio as
it only listens to one channel at a time and channels may be changed or the talker turned off by it's owner.

## Installation
To install:

- Log into your MUD with an admin account.
- Access the administrative menu via the 'arch' command.
- Select modules
- Select 'e' to enable a module
- Select Talker from the list of available modules.
- Confirm that this module should be enabled.
- Restart your mud. The builder commands should now be available.

## Usage

Once this module is installed you will need to create at least one item type with the TALKER flag.
Characters who are carrying an item with the TALKER flag will have access to the "talker" command.

## Commands

- talker: the talker command lets players turn their talker on, off, speak on a talker channel, or change the channel.

