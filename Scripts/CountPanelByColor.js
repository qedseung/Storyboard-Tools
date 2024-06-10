/*
Author: Steven Seung 29/05/2024
Storyboard Pro script that counts and calculates percentage of green/completed panels.
Set Script Manager to invoke CountPanel
Other Colors:
#cc3333 red
#d9d20a yellow
#58aa4d green
#000000 default
*/

function CountPanel()
{
	var sb = new StoryboardManager();
	var count = 0;
	const color = "#58aa4d";
	var totalp = sb.numberOfPanelsInProject();
	for(var p = 0; p < totalp; p++){
		var hex = sb.getPanelColor(sb.panelInProject(p));
		if (hex == color){
			count++;
		}
	}
	var per = 100*count/totalp;
	var res = "Completed Panels: " + count + " of " + totalp + " Percentage: " + per.toPrecision(3) + "%";
	MessageBox.information(res);
}
