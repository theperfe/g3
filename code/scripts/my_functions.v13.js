
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
  var current_node_type = null;
  if(graph1.nodes.length > 0) current_node_type = graph1.nodes[0].label;
  var possible_matching_nodes = graph2.nodes.filter(function(element){return element.label == current_node_type});
  var all_matches = {'type':'root_node', 'name':'root', 'child':[]};
  var result1 = null, result2 = null, result = null;
  var current_node_obj = null, current_node = null;
  for(var p=0; p<possible_matching_nodes.length; p++){
   current_node = extract_relevant_data(possible_matching_nodes[p]);
   current_node.rule_index = 0;
   current_node_obj = {'type':'node', 'name':current_node, 'child':[]};
   for(var q=0; q<graph1.link_types.length; q++){
     result1 = sub_match(graph1, graph2, graph1.link_types[q], predecessors(graph1, graph1.nodes[0], graph1.link_types[q]), predecessors(graph2, possible_matching_nodes[p], graph1.link_types[q]), [graph1.nodes[0]], [possible_matching_nodes[p]]);
     result2 = sub_match(graph1, graph2, graph1.link_types[q], successors(graph1, graph1.nodes[0], graph1.link_types[q]), successors(graph2, possible_matching_nodes[p], graph1.link_types[q]), [graph1.nodes[0]], [possible_matching_nodes[p]]);
     if(result1 && result2){
       result = merge(result1, result2);
       result.forEach(function(element){
         element.child = merge_node_types(element.child);
	 current_node_obj.child.push(element);
       });
     }
     else break;
   }
   if(q == graph1.link_types.length) all_matches.child.push(current_node_obj);	//Here I am assuming that the LHS is always a connected graph
  }
  return all_matches;
}

function sub_match(lhs, mg, lt, lpsl, mpsl, lvp, mvp){
  if(lpsl.length == 0) return [];
  if(lpsl.length > mpsl.length) return false;
  lpsl = lpsl.filter(function(element){return lvp.indexOf(element) == -1;})
  if(lpsl.length == 0) return [];
  mpsl = mpsl.filter(function(element){return mvp.indexOf(element) == -1;})
  if(lpsl.length > mpsl.length) return false;
  var current_link_type_obj = {'type':'link_type', 'name':lt, 'child':[]};
  var current_node_type_obj = null, current_node_obj = null, current_node = null,
      result = null, result1 = null, result2 = null,
      lhs_pred = null, lhs_succ = null, mg_pred = null, mg_succ = null, arr = null, 
      nlpsl = null, nmpsl = null, 
      combs = null, perms = null, perm = null;
  for(var i=0; i<lhs.node_types.length; i++){
    nlpsl = lpsl.filter(function(element){return element.label == lhs.node_types[i];});
    if(nlpsl.length == 0) continue;
    nmpsl = mpsl.filter(function(element){return element.label == lhs.node_types[i];});
    if(nlpsl.length > nmpsl.length) return false;
    combs = combinations(nmpsl, nlpsl.length);
    perms = [];
    combs.forEach(function(element){
      perm = permutations(element);
      perm.forEach(function(local_element){
	perms.push(local_element);
      });
    });
    current_node_type_obj = {'type':'node_type', 'name':lhs.node_types[i], 'child':[]};
    for(var x=0; x<perms.length; x++){
      arr = [];
      for(var y=0; y<perms[x].length; y++){
        current_node = extract_relevant_data(perms[x][y]);
	current_node.rule_index = lhs.nodes.indexOf(nlpsl[y]);
        current_node_obj = {'type':'node', 'name':current_node, 'child':[]};
	lvp.push(nlpsl[y]);
	mvp.push(perms[x][y]);
	for(var j=0; j<lhs.link_types.length; j++){
	  lhs_pred = predecessors(lhs, nlpsl[y], lhs.link_types[j]);
	  mg_pred = predecessors(mg, perms[x][y], lhs.link_types[j]);
	  lhs_succ = successors(lhs, nlpsl[y], lhs.link_types[j]);
	  mg_succ = successors(mg, perms[x][y], lhs.link_types[j]);
	  result1 = sub_match(lhs, mg, lhs.link_types[j], lhs_pred, mg_pred, lvp, mvp);
	  result2 = sub_match(lhs, mg, lhs.link_types[j], lhs_succ, mg_succ, lvp, mvp);
	  if(result1 && result2){
	    result = merge(result1, result2);
	    result.forEach(function(element){
	      element.child = merge_node_types(element.child);
	      current_node_obj.child.push(element);
	    });
	  }
	  else break;
	}
	if(j == lhs.link_types.length) arr.push(current_node_obj);
	else break;
      }
      for(var z=y-1; z>=0; z--){
        lvp.pop();
        mvp.pop();
      }
      if(y==perms[x].length && arr.length != 0) current_node_type_obj.child.push(arr);
    }
    if(current_node_type_obj.child.length == 0) return false;
    else current_link_type_obj.child.push(current_node_type_obj);
  }
  if(current_link_type_obj.child.length == 0) return [];
  else return [current_link_type_obj];
}

function extract_random_path(tree){		//extract random path from output tree of graph matching algo
  if(tree.child.length == 0) return [];
  var index = Math.floor(Math.random()*(tree.child.length));
  var path = extract_random_path_from_element(tree.child[index]);
  path.push(tree.child[index].name);
  return path;
}

function extract_random_path_from_element(e){
  var random_path = [], index = 0, path = [];
  e.child.forEach(function(element){	//for each link type
    element.child.forEach(function(local_element){	//for each node type
      index = Math.floor(Math.random()*(local_element.child.length));	//for some arbitrary child of this node type
      local_element.child[index].forEach(function(el){
        path = extract_random_path_from_element(el);
	path.push(el.name);
	path.forEach(function(ele){
	  random_path.push(ele);
	});
      });
    });
  });
  return random_path;
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

function extract_relevant_data(node){
  var new_node = {};
  new_node.key = node.key;
  new_node.label = node.label;
  new_node.name = node.name;
  new_node.color = node.color;
  new_node.width = node.width;
  new_node.height = node.height;
  new_node.visible_label = node.visible_label;
  return new_node;
}
