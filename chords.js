// chords.js
// JavaScript functionality for creating a chord & harmony explorer.
//
// Copyright 2014 Dave Corboy <dave@corboy.com>
//
// This file is part of Harmony-Explorer.
// Harmony-Explorer does some interesting things that I will summarize
// at some point FIXME
//
// Harmony-Explorer is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Harmony-Explorer is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// If you did not receive a copy of the GNU General Public License
// along with Harmony-Explorer, see <http://www.gnu.org/licenses/>.

var notes = ['C','C# / Db','D','D# / Eb','E','F','F# / Gb','G','G# / Ab','A','A# / Bb','B'];
var disp = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var chordnames = ['Major','Major 7th','Major 9','Major 11','Major 13','Major 7th add 11','Major 7th add 13','Major 7th Sus4','Major 9 Sus4','Minor','Minor 6','Minor 7th','Minor 9','Minor 11','Minor 13','Minor add 9','Minor 6 add 9','Minor 7th add 11','Minor 7th add 13','Minor Major 7th','Minor Major 9','Minor Major 11','Minor Major 13','Minor Major 7th add 11','Minor Major 7th add 13','Dominant 7th','Dominant 7th add 11','Dominant 7th add 13','Sus 2','Sus 4','6sus4','7sus4','9sus4'];
var chordformulas = ['0,4,7','0,4,7,11','0,2,4,7,11','0,2,4,5,7,11','0,2,4,7,9,11','0,4,5,7,11','0,4,7,9,11','0,5,7,11','0,2,5,7,11','0,3,7','0,3,7,9','0,3,7,10','0,2,3,7,10','0,2,3,5,7,10','0,2,3,7,9,10','0,2,3,7','0,2,3,7,9','0,3,5,7,10','0,3,7,9,10','0,3,7,11','0,2,3,7,11','0,2,3,5,7,11','0,2,3,7,9,11','0,3,5,7,11','0,3,7,9,11','0,4,7,10','0,4,5,7,10','0,4,7,9,10','0,2,7','0,5,7','0,5,7,9','0,5,7,10','0,2,5,7,10'];
var harmonynames = ['I','ii','iii','IV','V','vi','vii','5/5'];
var harmonyformulas = ['0,2,4','1,3,5','2,4,6','3,5,7','4,6,8','5,7,9','6,8,10','1,#3,5'];

var majorscale = [0,2,4,5,7,9,11];	// intervals of the major scale
var minorscale = [0,2,3,5,7,8,10];	// intervals of the minor scale


MIDI.USE_XHR = false;	// allows MIDI.js to run from file:

var gChord = [];	// array of MIDI note numbers representing current chord
var gKey = 0;		// root note of current key where C=0 and B=11
var gScale = [];	// array of major or minor scale intervals, depending on current setting

// playChord (chord)
// chord - array of MIDI note values
//
// Basically a pass-through to MIDI.js.
function playChord(chord) {
	var delay = 0;
	var velocity = 127; // how hard the note hits
	MIDI.setVolume(0, 127);

	MIDI.chordOn(0, chord, velocity, delay);
}

// chgChord (root, chord)
// root - string representation of a root note where C=0 and B=11
// chord - a select element containing the chord formula as its value 
//
// Sets the global chord to the chord defined by the root note
// and the chord formula FIXME don't pass an element here.
function chgChord (root, chord)
{
	var rootnote = parseInt(root);
	var chordformula = chord.value.split(',');
	var output = '';
	
	gChord.length = 0;	// reset chord array

	for (var i=0; i<chordformula.length; i++) {
		var note = rootnote + parseInt(chordformula[i]);
		output += (disp[note%12] + ' '); 
		gChord.push(note+60);	// FIXME adjust for octave later
	}
	document.getElementById("chordoutput").innerHTML = output;
}

// chgKey (root, major)
// root - string representation of a root note where C=0 and B=11
// major - a boolean indicating major or minor key 
//
// Sets the global key to the root note
// and sets the global scale to either major or minor intervals.
function chgKey(root, major)
{
	gKey = parseInt(root);
	if (major) gScale = majorscale;
	else gScale = minorscale;
}

// playHarmony(harmony, octave)
// harmony - indexes into harmonyformulas for a harmony coding
//   ['0,2,4','1,3,5','2,4,6', ...
//     note: h4 is '3,5,7', not '3,5,0'
//   Past the basic harmonies, we need to encode # and b
//     so 5/5 is '1,#3,5'
//     5/4 is '1,3,5,b7'
// octave - defines the octave above/below middle C
//
// Decodes the harmony chord based on the harmony formula,
// the global key gKey and the global major/minor scale gScale
// then plays the chord.
function playHarmony(harmony, octave)
{
	var chord = [];
	var harmonyformula = harmonyformulas[harmony].split(',');

	for (var i=0; i<harmonyformula.length; i++) {
		var n;
		var str = harmonyformula[i];
		var a = (str.charAt(0) == 'b') ? -1 : ((str.charAt(0) == '#') ? 1 : 0);	// set a to +1 for '#' and -1 for 'b'

		if (a) n = parseInt(str.slice(1));
		else n = parseInt(str);
		console.log('formula extraction: ', n, a);

		var idx = n%7;
		var r = (n/7) >> 0;
		console.log('index extraction: ', idx, r);

		var note = 60 + gKey + gScale[idx] + (r+octave) * 12 + a;
		console.log('note: ', note);
		
		chord.push(note);
	}

	playChord(chord);
}

function startup() {
	// set up the UI and whatnot

	var parent = document.getElementById('chordroot');
	var parent2 = document.getElementById('keyroot');
	var len = notes.length;
	var chord;

	for (var i = 0; i < len; i++) {
		var elem = document.createElement('option')
		elem.value = i;
		elem.innerHTML = notes[i];
		parent.appendChild(elem);
		parent2.appendChild(elem.cloneNode(true));
	}
	parent.selectedIndex = "0";
	parent2.selectedIndex = "0";

	parent = document.getElementById('chord');
	len = chordnames.length;
	for (var i = 0; i < len; i++) {
		var elem = document.createElement('option')
		elem.value = chordformulas[i];
		elem.innerHTML = chordnames[i];
		if (i == 0) {
			elem.selected = "selected";
			chord = elem;
		}
		parent.appendChild(elem);
	}

	parent = document.getElementById('harmonybuttons');
	for (var j = 0; j < 3; j++) {		// three rows of harmony buttons, starting at C3
		var child = document.createElement('div');
		child.id = 'harmonies'+j;
		child.className = 'harmonies';

		var label = document.createElement('label');
		//label.id = 'harmonies'+j;
		label.className = 'hmy-label';
		label.innerHTML = 'C'+(5-j)+': ';	// really, this all needs to be octave generalized
		child.appendChild(label);

		len = harmonynames.length;
		for (var i = 0; i < len; i++) {
			var elem = document.createElement('button');
			elem.innerHTML = harmonynames[i];
			elem.setAttribute('onclick','playHarmony('+i+', '+(1-j)+');');
			child.appendChild(elem);
		}
		parent.appendChild(child);
	}

	document.getElementById("modemajor").checked = true;
	chgChord('0', chord);	// C Major
	chgKey('0', true);		// C Major
	playChord(gChord);
}

function init() {
	// load and initialize the MIDI.js plugin

	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		callback: function() {
			startup();
		}
	});
}