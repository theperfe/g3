
function permutations(list){
  if(list.length==0) return [[]];
  if(list.length==1) return [list];
  var perms = permutations(list.slice(1));
  var result = [];
  for(var i in perms){
    for(var j=0; j<perms[i].length+1; j++){
      var temp = [];
      temp = perms[i].slice(0,j);
      temp.push(list[0]);
      temp = temp.concat(perms[i].slice(j));
      result.push(temp);
      }
  }
  return result;
}

function combinations(l, r){
  if(r==0) return [[]];
  else if(l.length == r) return [l];
  else if(l.length < r) {console.log("error: r > n"); return;}
  else{
    var large_arr = [];
    var comb = combinations(l.slice(1), r);
    large_arr = large_arr.concat(comb);
    var comb = combinations(l.slice(1), r-1);
    for(var c=0; c<comb.length; c++){
     var arr = [];
     arr.push(l[0]);
     arr = arr.concat(comb[c]);
     large_arr.push(arr);
    }
    return large_arr;
  }
}

function match(graph1, graph2){
  console.log(graph1);
  console.log(graph2);
  var current_node_type = null;
  if(graph1.nodes.length > 1) current_node_type = graph1.nodes[0].label;
  var possible_matching_nodes = graph2.nodes.filter(function(element){return element.label == current_node_type});
  var all_matches = {'type':'root_node', 'name':'root', 'child':[]};
  var result1 = null, result2 = null, result = null;
  possible_matching_nodes.forEach(function(element){
    var link_types_obj_arr = [];
    var results_arr = [];
    graph1.link_types.forEach(function(local_element){
      result1 = sub_match(graph1, graph2, predecessors(graph1, graph1.nodes[0], local_element), predecessors(graph2, element, local_element), [graph1.nodes[0]], [element])
      result2 = sub_match(graph1, graph2, successors(graph1, graph1.nodes[0], local_element), successors(graph2, element, local_element), [graph1.nodes[0]], [element])
      if(result1 && result2) {
        result = merge(result1, result2);
	results_arr.push(result);
      }
      else results_arr = [];
    });
    if(results_arr.length != 0){
        var final_result = [];
	results_arr.forEach(function(local_element){
	  final_result = merge(final_result, local_element);
	});
	var current_node = {'type':'node', 'name':element, 'child':[]};
	final_result.forEach(function(local_element){
	  current_node.child.push(local_element);
	});
	all_matches.child.push(current_node);
     }
  });
  return all_matches;
}

function sub_match(lhs, mg, lpsl, mpsl, lvp, mvp){	//lhs, main_graph, lhs predecessor/successor nodes, main graph predecessor/successor nodes, lhs visited path, main graph visited path.
  console.log("entered sub match");
  if(lpsl.length == 0) return [];
  else if(lpsl.length > mpsl.length) return false;
  var result1 = null, result2 = null;
  var link_types_obj_arr = [];
  for(var i=0; i<lhs.link_types.length; i++){
    var current_link_type_obj = {'type':'link_type', 'name':lhs.link_types[i], 'child':[]};
    for(var j=0; j<lhs.node_types.length; j++){
      var current_node_type_obj = {'type':'node_type', 'name':lhs.node_types[j], 'child':[]};
      var current_node_obj = null, result = null; //will be used later below
      var current_elements = lpsl.filter(function(element){return element.label == lhs.node_types[j]});
      var nlpsl = [];	//new lpsl of type j which are not visited earlier
      current_elements.forEach(function(element){
        if(lvp.indexOf(element) == -1) nlpsl.push(element);
      });
      if(nlpsl.length == 0) continue;
      current_elements = mpsl.filter(function(element){return element.label == lhs.node_types[j]});
      var nmpsl = [];	//new mpsl of type j which are not visited earlier
      current_elements.forEach(function(element){
        if(mvp.indexOf(element) == -1) nmpsl.push(element);
      });
      if(nlpsl.length > nmpsl.length) return false;
      //generating a permutation of nPr elements where n=length of nmpsl, r=length of lmpsl;
      //first generating combinations of cPr elements
      var combs = combinations(nmpsl, nlpsl.length);
      var perms = [];
      combs.forEach(function(element){
        perm = permutations(element);
	perm.forEach(function(local_element){
	  perms.push(local_element);
	});
      });
      for(var x=0; x<perms.length; x++){
	var arr = [];
        for(var y=0; y<perms[x].length; y++){
	  lvp.push(nlpsl[y]);
	  mvp.push(perms[x][y]);
	  var current_node_obj = {'type':'node', 'name':perms[x][y], 'child':[]};
	  result1 = sub_match(lhs, mg, predecessors(lhs, nlpsl[y], lhs.link_types[i]), predecessors(mg, perms[x][y], lhs.link_types[i]), lvp, mvp);
	  result2 = sub_match(lhs, mg, successors(lhs, nlpsl[y], lhs.link_types[i]), successors(mg, perms[x][y], lhs.link_types[i]), lvp, mvp);
	  if(result1 && result2) {
	    result = merge(result1, result2);
	    console.log(result);
	    result.forEach(function(element){
	      console.log("entered result");
	      element.child = merge_node_types(element.child);
	      current_node_obj.child.push(element);
	    });
	    arr.push(current_node_obj);
	  }
	  else break;
	}
	for(var z=y-1; z>=0; z--){
	  lvp.pop();
	  mvp.pop();
	}
	if((y == perms[x].length) && (arr.length != 0)){
	  current_node_type_obj.child.push(arr);
	}
      }
      if(current_node_type_obj.child.length == 0) return false;
      else current_link_type_obj.child.push(current_node_type_obj);
    }
    if(current_link_type_obj.child.length != 0) link_types_obj_arr.push(current_link_type_obj);
  }
  return link_types_obj_arr;
}


function predecessors(graph, node, link_type){
  var result = [];
  for(var i=0; i<graph.links.length; i++){
    if(typeof graph.links[i].target == "object") {
      var target_key = graph.links[i].target.key;
      var source_item = graph.links[i].source;
    }
    else {
      var target_key = graph.nodes[graph.links[i].target].key;
      var source_item = graph.nodes[graph.links[i].source];
    }
    if(target_key == node.key && graph.links[i].label == link_type) result.push(source_item);
  }

  return result;
}

function successors(graph, node, link_type){
  var result = [];
  for(var i=0; i<graph.links.length; i++){
    if(typeof graph.links[i].source == "object") {
      var source_key = graph.links[i].source.key;
      var target_item = graph.links[i].target;
    }
    else {
      var source_key = graph.nodes[graph.links[i].source].key;
      var target_item = graph.nodes[graph.links[i].target];
    }
    if(source_key == node.key && graph.links[i].label == link_type) result.push(target_item);
  }
  return result;
}

function merge(arr1, arr2){
  console.log("entered merge");
  if(arr1.length == 0) return arr2;
  else if(arr2.length == 0) return arr1;
  else{
    arr1.forEach(function(element){
      var index = arr2.indexOf(arr2.filter(function(local_element){return local_element.name == element.name;})[0]);
      if(index != -1){
        element.child = element.child.concat(arr2[index].child);
        arr2.splice(index,1);
      }
    });
    arr1 = arr1.concat(arr2); 
  }
  return arr1;
}

function merge_node_types(arr){
  console.log("entered merge node types");
  //get node labels
  var node_labels_arr = [];
  arr.forEach(function(element){
    node_labels_arr.push(element.name);
  });

  //get unique element names
  var unique_elements_arr = [];
  node_labels_arr.forEach(function(element){
    if(unique_elements_arr.indexOf(element) == -1) unique_elements_arr.push(element);
  });

  //take each node type and merge its children
  var final_arr = [];
  unique_elements_arr.forEach(function(element){
    var current_node_type_obj = {'type': 'node_type', 'name': element, 'child':[]};
    var current_type_list = arr.filter(function(local_element){return local_element.name == element;});
    current_type_list.forEach(function(local_element){
      current_node_type_obj.child = current_node_type_obj.child.concat(local_element.child);
    });
    final_arr.push(current_node_type_obj);
  });
  return final_arr;
}
