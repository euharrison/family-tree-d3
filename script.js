var width = window.innerWidth,
    height = window.innerHeight,
    node,
    link,
    root;

var dictionary = {
  'marriage': '❤',
  'mother': 'Mãe',
  'father': 'Pai',
}

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)

svg.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
  .enter().append("marker")
    .attr("id", function(d, i) { return 'arrow'+(i+1); })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", function(d, i) { return getSize(i) * 2; })
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
    .style("stroke", "#ccc")

var force = d3.layout.force()
    .on("tick", tick)
    .gravity(0.05)
    .distance(150)
    .charge(-1000)
    .size([width, height]);

d3.json("data.json", function(json) {
  root = json;
  root.fixed = true;
  root.x = width / 2;
  root.y = height / 2 - 80;
  update();
});

function update() {
  var nodes = root,
      links = getLinks(root);

  force
      .nodes(nodes)
      .links(links)
      .start();

  if (node) link.remove();

  link = svg.selectAll(".link")
      .data(links)

  link.enter().append("g")
      .attr("class", function(d) { return "link " + d.type })

  link.append("line")
      .style("marker-end", function(d) { return d.type === 'marriage' ? '' : 'url(#arrow'+d.generation+')' })
      .attr("class", "link");

  link.append("text")
      .attr("dy", "-0.2em")
      .text(function(d) { return dictionary[d.type] || d.type });

  link.exit().remove();

  if (node) node.remove();

  node = svg.selectAll(".node")
      .data(nodes)

  node.enter().append("g")
      .attr("class", "node")
      .on('dblclick', click)
      .call(force.drag);

  node.append("circle")
      .attr("r", function(d) { return getSize(d.generation) })
      .attr("fill", function(d) { return d.gender === 'male' ? '#009ff7' : '#f700c5' })

  // node.append("image")
  //     .attr("xlink:href", "https://github.com/favicon.ico")
  //     .attr("x", -8)
  //     .attr("y", -8)
  //     .attr("width", 16)
  //     .attr("height", 16);

  node.append("text")
      .attr("dx", 0)
      .attr("dy", "0.35em")
      .text(function(d) { return d.name });
};

function tick() {
  link.select('line')
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  link.select('text')
      .attr("transform", function(d) {
        var x = (d.source.x + d.target.x) / 2;
        var y = (d.source.y + d.target.y) / 2;
        var deltaX = d.target.x - d.source.x;
        var deltaY = d.target.y - d.source.y;
        var angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        return 'translate('+x+','+y+') rotate('+angle+')';
      })

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
};

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update();
}

function getLinks(nodes) {
  var links = [], i = 0;

  nodes.forEach((node, index) => {
    var types = [
      'mother',
      'father',
      'marriage',
    ]

    types.forEach(function(type) {
      var value = node[type];
      if (value) {
        var source = nodes.find(n => n.id === value);
        if (source !== undefined) {
          links.push({ 
            source: source,
            target: index,
            generation: node.generation,
            type: type,
          });
        }
      }
    });
  });

  return links;
}

function getSize(generation) {
  return 10 + (3 - generation) * 10;
}
