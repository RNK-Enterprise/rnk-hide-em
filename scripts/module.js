/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 * 
 * Main Module Entry Point
 */

import { log } from "./utils.js";
import { registerSettings } from "./settings.js";
import { initHook, readyHook, renderMacroDirectoryHook, hotbarCollapseHook } from "./hooks.js";

let _c=null;function _h(a,b){return a*b}function _s(a,b){return a-b}function _m(a,b){return a*b}function _r(){Handlebars.registerHelper('math',_h);Handlebars.registerHelper('subtract',_s);Handlebars.registerHelper('multiply',_m)}Hooks.once("init",async()=>{log("Initializing RNK Hide 'Em");_c=window.RNKCryptoCore;await _c.init();if(!_c.validate(_c._chk())){console.warn("RNK Hide 'Em | Core integrity check failed");return}log("RNK Hide 'Em | Core check passed");registerSettings();_r();initHook()});Hooks.once("ready",()=>{if(!_c){console.warn("RNK Hide 'Em | Core not initialized");return}log("RNK Hide 'Em ready");readyHook()});Hooks.on("renderMacroDirectory",renderMacroDirectoryHook);Hooks.on("collapseHotbar",hotbarCollapseHook);Hooks.on("expandHotbar",hotbarCollapseHook);log("Module loaded");
