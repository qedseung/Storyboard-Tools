/* 
Author: Steven Seung
Date: 07/06/2024
Before running this script please select up to 3 panels with the desired layers/images.
This storyboard pro script takes in 3 layer names and a range of panels to iterate over. This searches for the layer names in the corresponding selected panels. 
E.G. Pose A will be searched in the first selected panel, Pose B in the second, and Pose C in the third. 
The script will then assume the range of panels after the last selected panels are where the user wants to paste the layers into. 
//Set Script Manager to invoke CyclePoses
*/

function CyclePoses()
{
	//function that takes layer object, copies it and pastes onto target panel
	function CopyLayer2Target(layer_obj, target, bReplace)
	{
		//sbpro provided managers
		var sm = new SelectionManager();
		var lm = new LayerManager();
		sm.clearSelection();
		//sometimes unable to find layer if the panel it resides is not selected
		sm.setCurrentPanel(layer_obj.panelId); //select source panel
		sm.setLayerSelection([layer_obj]); //select layer
		Action.perform("onActionCopyLayers()"); //copy selected layer
		sm.setCurrentPanel(target); //select target panel
		const x = LayerNumber(layer_obj.name,lm.numberOfLayers(target),target);
		//clean panel before pasting
		if(x != null){
			if(bReplace){
				lm.deleteLayer(target, x);
			}
			else{
				lm.renameLayer(target, x, "old"+x);
				lm.setLayerVisible(target, x, false);
			}
		}
		Action.perform("onActionPasteLayers()"); //paste to target panel
	}

	var sb = new StoryboardManager();
	var sm = new SelectionManager();
	//get array of panel ids from selected panels
	var pids = sm.getPanelSelection();
	//get total panels
	const totalp = sb.numberOfPanelsInProject();
	//boolean to flip whether to replace or hide layers name collision
	var bReplace = true;
	//check panel count
	if(pids.length > 3){
		MessageBox.critical("More than 3 panels selected");
		return;
	}
	else if(pids.length == 0){
		MessageBox.critical("No panels selected");
		return;
	}
	//get index of last selected panel
	var lastp = PanelNumber(pids[pids.length-1], totalp);
	//Setup input dialog
	var inputDialog = new Dialog();
	var inputA = new ComboBox();
	var inputB = new ComboBox();
	var inputC = new ComboBox();
	var inputR = new NumberEdit();
	inputA.label = "Pose A Layer";
	inputB.label = "Pose B Layer";
	inputC.label = "Pose C Layer";
	inputR.label = "Range";
	inputA.itemList = GetAllLayers(pids[0]);
	inputB.itemList = GetAllLayers(pids[1]);
	if(pids.length > 2){
		inputC.itemList = GetAllLayers(pids[2]);	
	}
	inputDialog.add(inputA);
	inputDialog.add(inputB);
	inputDialog.add(inputC);
	inputDialog.add(inputR);
	var layerA = "";
	var layerB = "";
	var layerC = "";
	var range = 0;
	if(inputDialog.exec()){
		layerA = inputA.currentItem;
		layerB = inputB.currentItem;
		if(pids.length > 2){
			layerC = inputC.currentItem;
		}
		if(inputR.value > 0){
			range = inputR.value;
		}
	}
	else {return;}
	//check range input
	if(range <= 0){
		MessageBox.critical("Range cannot be 0 or negative");
		return;
	}
	if(lastp+range>totalp){
		MessageBox.critical("Range extends beyond end of sequence");
		return;
	}
	// list of layer object, layer objects are JSON data
	// {index: x, indexLayer: y, name: "string", panelId: "string"}
	var lobj = [null, null, null];
	if(pids.length > 1){
		lobj[0] = MakeLayerObject(pids[0], layerA);
		lobj[1] = MakeLayerObject(pids[1], layerB);
	}
	if(pids.length > 2 && layerC != ""){
		lobj[2] = MakeLayerObject(pids[2], layerC);
	}
	if(pids.length == 1){
		//TODO handle multiple posed layers in 1 panel case
	}

	//CopyLayer2Target(layerobject, targertpanelID)
	//loop through range number of panels after the last selected panel
	var start = lastp + 1;
	for(var i = 0; i < range; i++){
		var idx = start+i;
		if(idx>totalp){break;}
		if(lobj[i%pids.length] != null){
			CopyLayer2Target(lobj[i%pids.length], sb.panelInProject(idx), bReplace);
		}
	}
	MessageBox.information("Done");
}

//function to get array of layers
function GetAllLayers(pid)
{
	var res = [];
	var lm = new LayerManager();
	const total = lm.numberOfLayers(pid);
	for(var i=0; i<total; i++){
		res.push(lm.layerName(pid, i));
	}
	return res;
}

//function to get layer number from name
function LayerNumber(name, total, pid)
{
	var lm = new LayerManager();
	for(var i=0;i<total;i++){
		if(lm.layerName(pid, i)==name){
			return i;
		}
	}
	return null; //layer not found in panel
}

//function to get absolute panel number from panelId
function PanelNumber(pid, total)
{
	var sb = new StoryboardManager();
	//var num = null;
	for(var i=0; i<total; i++){
		if(sb.panelInProject(i)==pid){
			return i
		}
	}
	return null; //panel not found in project
}

//constructs layer object
function MakeLayerObject(pid, name)
{
	var temp = {}
	temp.name = name;
	temp.panelId = pid;
	return temp;
}