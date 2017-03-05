
var tables = [];
var displayedTable = {};

function filter() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = $('#myInput')
    filter = input[0].value.toUpperCase()
    ul = $("#myTableList")
    li = ul[0].getElementsByTagName('a');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i]
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

//hide and show elements
function checkboxClick(checkboxElem, fromlayout)
{
  if (checkboxElem.checked) {
    document.getElementById("myTableList").style.visibility = "hidden"
    document.getElementById("hideall").style.visibility = "hidden"
    document.getElementById("showall").style.visibility = "hidden"
    document.getElementById("myInput").style.visibility = "hidden"

    document.getElementById("myInput").style.display = "none"

    switchToSummarized(myDiagram)
    if (fromlayout != true){
      displaySummarized(ae_summ1, ae_summ2, ar)
    }
  } else {
    document.getElementById("myTableList").style.visibility = "visible"
    document.getElementById("hideall").style.visibility = "visible"
    document.getElementById("showall").style.visibility = "visible"
    document.getElementById("myInput").style.visibility = "visible"

    document.getElementById("myInput").style.display = "inline"
    switchToER(myDiagram)
    if (fromlayout != true){
      displayTable(displayedTable)
    }
  }
}
//handle dropdown
function toggleTables()
{
  document.getElementById("TableList").classList.toggle("show");
}

function toggleLayout()
{
  document.getElementById("layoutList").classList.toggle("show");
}

/*Get layout data from backend and store in Saved layout button*/
function toggleSavedLayout(){
	$.get('/get_layout', function(data,status){
// 		alert("Data: "+JSON.stringify(data) +'\nStatus: '+status);
		$("#myLayoutList").html('<a id="'+data[0].name + '">'+data[0].name+'</a>');
		for(var i=1; i<data.length; i++){
			$("#myLayoutList").append('<a id="'+data[i].name + '">'+data[i].name+'</a>');
		}
		$("#myLayoutList a").click(function(){
				for(var item in data){
					if(this.id == data[item].name){					
						myDiagram.model = new go.GraphLinksModel(data[item].layout[0], data[item].layout[1]);
					}			
				}
			});		
	
	});
	
	document.getElementById("Layout_List").classList.toggle("show");
}

//hide all elements
 function hideall()
 {
   displayedTable = {}
   displayTable(displayedTable)
 }

//add all items to ist and show them
 function showall()
 {
   displayedTable = {}
   for (var key in tables) {
    if (tables.hasOwnProperty(key)) {
      displayedTable[key] = tables[key]
    }
  } 
   displayTable(displayedTable)
 }


 function expandTree(data){
   var reloadTable = false;
   displayedTable[data.key].referencedTables.forEach(function(element) {
     if(displayedTable[element] == undefined)
     {
       displayedTable[element] = tables[element]
       reloadTable = true;
     }
   }, this);
   if(reloadTable)
      displayTable(displayedTable)
 }

 function displaySummarized(square1, square2, diamond)
 {
  	var nodeDataArray = []
     var linkDataArray = []
   
   if(typeof square1.location == 'undefined')
   {
     nodeDataArray.push({"key":square1.name, "items":square1.data, "fig":"RoundedRectangle"})
   }
   else
   {
     nodeDataArray.push({"key":square1.name, "items":square1.data, "loc":square1.location, "fig":"RoundedRectangle"})
   }

   if(typeof diamond.location == 'undefined')
   {
    nodeDataArray.push({"key":diamond.name, "items":diamond.data, "fig":"Diamond"})
   }
   else
   {
     nodeDataArray.push({"key":diamond.name, "items":diamond.data, "loc":diamond.location, "fig":"Diamond"})
   }

   if(typeof square2.location == 'undefined')
   {
    nodeDataArray.push({"key":square2.name, "items":square2.data, "fig":"RoundedRectangle"})
   }
   else
   { 
    nodeDataArray.push({"key":square2.name, "items":square2.data, "loc":square2.location, "fig":"RoundedRectangle"})
   }
   
   
   linkDataArray.push({"from":square1.name, 'to':diamond.name })
   linkDataArray.push({"from":square2.name, 'to':diamond.name })

   myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

 }

//save layout of myDiagram
 function saveLayout() {
   var layout = []
   layout.push(myDiagram.model.nodeDataArray)
   layout.push(myDiagram.model.linkDataArray)
   var summarized = document.getElementById("summarized").checked
   var save = prompt("Please enter a layout name"); 
		if (save != null) {		
				var data = {
					'name':save,
					"layout":layout,
					"state":summarized
				};
			
			/*send layout data to back end*/
			$.ajax({
					type: 'POST',
					data: JSON.stringify(data),
					contentType: 'application/json',
					url: '/save_layout',
					success:function(text){
						//alert(text);
					}
			});
		}
 }
 
 function displayTable(dataTable) {
    // create the model for the E-R diagram
    var nodeDataArray = [];
    var linkDataArray = [];
    var keys = Object.keys(dataTable);
    for(var j=0; j < keys.length; j++)
    {
      var columns = []
      for(var i=0; i < dataTable[keys[j]].length; i++)
      {
          columns.push({"name":dataTable[keys[j]][i]['name']});
          if(dataTable[keys[j]][i]['referenced_table_name'] !== null && dataTable[keys[j]][i]['referenced_table_name'] !== undefined)
          {
              linkDataArray.push({"from":keys[j],'to':dataTable[keys[j]][i]['referenced_table_name']})
          }
      }
      if(typeof dataTable[keys[j]].location == 'undefined'){
        nodeDataArray.push({"key":keys[j], "items":columns})
      }
      else
      {
        nodeDataArray.push({"key":keys[j], "items":columns})
      }
    }
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
      
}


 function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var data = base64Data.substr(base64Data.indexOf(",") + 1)
    var byteCharacters = atob(data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
 
 function exportLocal( filename) {
   myDiagram.scale = 1;

    var imgBlob = myDiagram.makeImageData({
    scale:1,
    type: "image/png"
    });

    var a = document.createElement("a")
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(base64toBlob(imgBlob, "image/png"), filename);
    else { // Others
        var url = URL.createObjectURL(base64toBlob(imgBlob, "image/png"));
        a.href = url;
        a.download = "image/png";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

//change selection
function onSelectionChanged(node) {
    myDiagram.centerRect(node.actualBounds);
  }

 function setupDiagram() {
    var $ = go.GraphObject.make;
    myDiagram = $(go.Diagram, "myDiagramDiv",
    {   initialContentAlignment: go.Spot.Center,
        allowDelete:false,
        allowCopy: false,
        layout: $(go.ForceDirectedLayout),
        "undoManager.isEnabled":true
    });
    
    var bluegrad = $(go.Brush, "Linear", { 0: "rgb(150,150,250)", 0.5:"rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
    var greengrad = $(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
    var redgrad = $(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
    var yellowgrad = $(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
    var lightgrad = $(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });
    
    // the template for each attribute in a node's array of item data
    itemTempl =
      $(go.Panel, "Horizontal",
        $(go.TextBlock,
          { stroke: "#333333",
            font: "bold 14px sans-serif" },
          new go.Binding("text", "name"))
      );
    
    switchToER(myDiagram);
      
      // define the Link template, representing a relationship
    myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        {
          selectionAdorned: true,
          layerName: "Foreground",
          reshapable: true,
          routing: go.Link.AvoidsNodes,
          corner: 5,
          curve: go.Link.JumpOver
        },
        $(go.Shape,  // the link shape
          { stroke: "#303B45", strokeWidth: 2.5 }),
        $(go.TextBlock,  // the "from" label
          {
            textAlign: "center",
            font: "bold 14px sans-serif",
            stroke: "#1967B3",
            segmentIndex: 0,
            segmentOffset: new go.Point(NaN, NaN),
            segmentOrientation: go.Link.OrientUpright
          },
          new go.Binding("text", "text")),
        $(go.TextBlock,  // the "to" label
          {
            textAlign: "center",
            font: "bold 14px sans-serif",
            stroke: "#1967B3",
            segmentIndex: -1,
            segmentOffset: new go.Point(NaN, NaN),
            segmentOrientation: go.Link.OrientUpright
          },
          new go.Binding("text", "toText"))
      );
      document.getElementById("layoutList").addEventListener("click", function(e){
        if(e.target && e.target.nodeName == "A"){
          myDiagram.layout = $(go[e.target.id])
        }
      });
 }

 function switchToSummarized(obj){
   var $ = go.GraphObject.make;
   var lightgrad = $(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });
   obj.nodeTemplate =
      $(go.Node, "Auto",  // the whole node panel
        { selectionAdorned: true,
          selectionChanged: onSelectionChanged,
          resizable: true,
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
          isShadowed: true,
          shadowColor: "#C5C1AA" },
        new go.Binding("location", "location").makeTwoWay(),
        new go.Binding("location", "loc", go.Point.parse),
        $(go.Shape,
        {
          name: "SHAPE",
          fill: $(go.Brush, "Linear", { 0.0: "white", 1.0: "gray" }),
        },
        new go.Binding("figure", "fig")),
        // define the node's outer shape, which will surround the Table
        $(go.Panel, "Table",
          { margin: 8, stretch: go.GraphObject.Fill },
          $(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
          // the table header
          $(go.TextBlock,
            {
              row: 0, alignment: go.Spot.Center,
              margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
              font: "bold 16px sans-serif"
            },
            new go.Binding("text", "key")),
            $("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
            { row: 0, alignment: go.Spot.TopRight }),
          // the list of Panels, each showing an attribute
          $(go.Panel, "Vertical",
            {
              name: "LIST",
              row: 1,
              padding: 3,
              alignment: go.Spot.TopLeft,
              defaultAlignment: go.Spot.Left,
              stretch: go.GraphObject.Horizontal,
              itemTemplate: itemTempl
            },
            new go.Binding("visible", "show").makeTwoWay(),
            new go.Binding("itemArray", "items"))
        ),  // end Table Panel
        {
        contextMenu:     // define a context menu for each node
          $(go.Adornment, "Vertical",  // that has one button
            $("ContextMenuButton",
              $(go.TextBlock, "Drill Into"),
              { click: function(e, obj) { drillInto(obj.part.data); } })
            // more ContextMenuButtons would go here
          )  // end Adornment
      }
      );
 }

 function drillInto(data){
   var check = document.getElementById('summarized')
    check.checked = !check.checked
    checkboxClick(check, true)
    displayedTable = {}
    data.items.forEach(function(element) {
      displayedTable[element.name] = tables[element.name]
    }, this);
    displayTable(displayedTable)
 }

 function switchToER(obj){
   var $ = go.GraphObject.make;
   var lightgrad = $(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });
    obj.nodeTemplate =
      $(go.Node, "Auto",  // the whole node panel
        { selectionAdorned: true,
          selectionChanged: onSelectionChanged,
          resizable: true,
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
          isShadowed: true,
          shadowColor: "#C5C1AA" },
        new go.Binding("location", "location").makeTwoWay(),
        new go.Binding("location", "loc", go.Point.parse),
        // define the node's outer shape, which will surround the Table
        $(go.Shape, "Rectangle",
          { fill: lightgrad, stroke: "#756875", strokeWidth: 3 }),
        $(go.Panel, "Table",
          { margin: 8, stretch: go.GraphObject.Fill },
          $(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
          // the table header
          $(go.TextBlock,
            {
              row: 0, alignment: go.Spot.Center,
              margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
              font: "bold 16px sans-serif"
            },
            new go.Binding("text", "key")),
            { doubleClick: function(e, obj) { expandTree(obj.part.data); } },
          // the collapse/expand button
          $("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
            { row: 0, alignment: go.Spot.TopRight }),
          // the list of Panels, each showing an attribute
          $(go.Panel, "Vertical",
            {
              name: "LIST",
              row: 1,
              padding: 3,
              alignment: go.Spot.TopLeft,
              defaultAlignment: go.Spot.Left,
              stretch: go.GraphObject.Horizontal,
              itemTemplate: itemTempl
            },
            new go.Binding("visible", "show").makeTwoWay(),
            new go.Binding("itemArray", "items"))
        )  // end Table Panel
      );
 }
 

