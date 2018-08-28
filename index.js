// CS235 User Interface Design  -D3 Graphs using JavaScript
// Assignment 4
// This is a Force Directed Graph example using D3 and JavaScript.
// A highly modified version of the source code from this example
//
// https://bl.ocks.org/mbostock/950642
//
// This example deals in visualizing relations/hierarchy between the characters
// of a popular TV series "Game of Thrones".
//
// Visualization is done using froce directed graph to show the following:
//    1. Top Contenders for the Iron Throne
//    2. Contender's supporters/council members
//
// There are various functionalities supported by the code:
// 1. Nodes are attached to an image of the character and with circles
//    denoting their house color. //Pre-attentive feature and filtering
// 2.Hover Function
//   -When user hover's over a node, 
//     it is presented with the name and status(dead/Alive) of the character   
//     represented by the node.
//   -Hover msg box has pre-attentive "color" property. 
//     House Color is used to differentiate.
//   -Image size increases as you hover over a node to render selection.
//   
// 3.Click event
//   On clicking the character icon, a display box is shown with the 
//   character's House Banner and House Name.
//   For Charcters that don't belong to nobel houses, a default image is shown.
//
//  Data has been pulled from data.json file.
//
//  Made changes to package.json to get V3 of D3. Installed D3: 3.0, image-loader 
//  using npm install
//  Application needs web connectivity to load image urls.
//  -Paridhi Agrawal


var d3   = require('d3');
var jdata = require('./data.json');

//Get an Image and Decrepition Box for House Banner and House Name
var div1 = d3.select("body").append("div")
.style("top","-110px").style("left","-10px")
.style("opacity", 1).style("box-shadow","5px 5px 5px #888888").style("border-style","outset");

div1.html("Click character to reveal their House").style("font","14px").style("text-decoration","underline");

//Get an Image Box to Show House banners of Clicked node
var img1 = div1
.append("img").attr("class","my_img").attr("src","http://i66.tinypic.com/15otq2b.jpg")
.attr("width",150)
.attr("height",200)
.style("float","left").style("border-radius", "8px");

//Description Box to show their house
var desc = div1.append("div")
            .attr("class","infoMsg")
            .attr("width",100)
            .attr("float","right")
            .attr("height",150)
            .style("opacity", 1.0);
    
desc.html("Game of Thrones");

// Setup SVG Area
//var svg_div = d3.select("body").append("div").attr("class","svg_div").style("opacity",0.6).style("filter","alpha(opacity=60)");
var svg = d3.select("body").append("svg").style("opacity",1).attr("width", 1020).attr("height", 800),
margin = {top: 20, right: 20, bottom: 20, left: 20},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom,
g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Setup force-driven graph
var force = d3.layout.force()
            .gravity(0.05)
            .charge(-1200)
            .size([width, height]);

 //console.log(jdata.nodes)

//Setup prog vars
 var w = 1020,
 h = 800,
 maxNodeSize = 70;
 
var vis = d3.select("#vis").append("svg").attr("width", w).attr("height", h);

//setup Path
var defs = vis.insert("svg:defs")
.data(["end"]);

defs.enter().append("svg:path")
.attr("d", "M0,-5L10,0L0,5");


//Div for HoverMsgBox 
var div2 = d3.select("body").append('div')
.attr("class","hovermsg")
.style("opacity",0);

//Start force driven graph by pulling nodes and links from json
force
  .nodes(jdata.nodes)
  .links(jdata.links)
  .linkDistance(170)
  .friction(0.6)
  .linkStrength(function(l, i) {return 1; })
  .size([w, h])
  .start();

  var path = vis.selectAll("path.link").data(jdata.links, function(d) { return d.target.id; });
  
  path.enter().insert("svg:path")
    .attr("class", "link")
    .style("stroke", "#eee")

//Appending Links before nodes, so that links appear behind node images
  var link = svg.selectAll("path.link")
    .data(jdata.links)
    .enter().append("path")
    .attr("class", "link");

  var node = svg.selectAll(".node")
    .data(jdata.nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(force.drag);
 
  //Append Circle 
  var circle = node.append("svg:circle")
  .style("stroke", function(d) {if(d.name == "Game Of Thrones"){ return "none"} else {return d.h_color}})
  .style("stroke-width", "6")
  .style("fill","none")
  .attr("r",36.5);

  
  //Append Image
 var images = node.append("svg:image")
  .attr("xlink:href", function(d){return d.img})
  .attr("x", function(d){if (d.name == "Game Of Thrones"){return -65;} else {return -35;}})
  .attr("y", function(d){if (d.name == "Game Of Thrones"){return -65;} else {return -35;}})
  .attr("width", function(d){if (d.name == "Game Of Thrones"){return 200;} else {return 70;}})
  .attr("height", function(d){if (d.name == "Game Of Thrones"){return 200;} else {return 70;}});

  //Set Events on nodes
  var setEvent = images
    .on( 'mouseenter', function(hoverObj) {
    //Resizing Center Node image to show selection 
    if (hoverObj.name == "Game Of Thrones"){
    // Getting current context
      d3.select( this )
        .transition()
        .attr("x",-75)
        .attr("y", -75)
        .attr("height", 250)
        .attr("width", 250);
   }
              
   else{
   //display msg about the selected node on hover
      div2.transition().style("opacity", 1.0);
      div2.html(hoverObj.name + "<br/>" +  "Status: "+hoverObj.status).style("left" ,(hoverObj.x+100) +"px")
         .style("top", (hoverObj.y +270) + "px").style("background",hoverObj.h_color);
      //Grow image to show selection
      d3.select( this )
      .transition()
      .duration(200)
      .attr("x", -45)
      .attr("y", -45)
      .attr("height", 90)
      .attr("width", 90);
  }
  })

    // Set to normal position on mouse leave
  .on( 'mouseleave', function(hoverObj) {
    d3.select( this )
    .transition()
    .attr("x", function(d) {if (d.name == "Game Of Thrones"){return -65;} else {return -35;}})
    .attr("y", function(d) {if (d.name == "Game Of Thrones"){return -65;} else {return -35;}})
    .attr("height", function(d){if (d.name == "Game Of Thrones"){return 200;} else {return 70;}})
    .attr("width", function(d){if (d.name == "Game Of Thrones"){return 200;} else {return 70;}});
    div2.transition().style("opacity", 0);
    img1.attr("src","http://i66.tinypic.com/15otq2b.jpg");
    desc.html("Game of Thrones");
   // d3.select(img).remove();
  })

  .on("click", function(d){
    div1.transition().style("opacity", 1)
    img1.attr("src", d.house_img);
    desc.html(d.house);
    /*svg.style("opacity",1);
    svg_div.style("background-image","url("+d.house_img+")")
    .style("background-repeat","no-repeat");*/
  });
            
  force.on("tick", function() {
    //drawing arch for links
        link.attr("d", function(d) {
          var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
         return "M" + d.source.x + "," + d.source.y + "A" + dr + "," 
             + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
         }); 
  node.attr("transform", nodeTransform);
 });
 // Gives the coordinates of the border for keeping the nodes inside a frame
function nodeTransform(d) {
  d.x =  Math.max(maxNodeSize, Math.min(w - (d.imgwidth/2 || 16), d.x));
  d.y =  Math.max(maxNodeSize, Math.min(h - (d.imgheight/2 || 16), d.y));
    return "translate(" + d.x + "," + d.y + ")";
}