
function permutations_with_repetitions(input_arr, output_arr_dimension){
  var output = [];
  if(input_arr.length == 0 || output_arr_dimension == 0) return [[]];
  var current_output = [], current_combo = [], max_symbol_index = input_arr.length - 1, current_index = 0;
  for(var i=0; i<output_arr_dimension + 1; i++){	//the last bit is to put an end to the process
    current_combo.push(0);	//initiating it with zeros
  }
  while(current_combo[current_combo.length-1] == 0){
    current_output = [];
    //push the current output into the output array
    for(var i=0; i<output_arr_dimension; i++){
      current_output[i] = input_arr[current_combo[i]];
    }
    output.push(current_output);

    //move to next combination
    while(current_index <= (output_arr_dimension+1) && current_combo[current_index] == max_symbol_index){
      current_combo[current_index] = 0;
      ++current_index;
    }
    if(current_index <= output_arr_dimension+1) ++current_combo[current_index];
    current_index = 0;
  }
  return output;
}

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
//     console.log(result1);
//	    console.log(JSON.stringify(result1));
     result2 = sub_match(graph1, graph2, graph1.link_types[q], successors(graph1, graph1.nodes[0], graph1.link_types[q]), successors(graph2, possible_matching_nodes[p], graph1.link_types[q]), [graph1.nodes[0]], [possible_matching_nodes[p]]);
//	    console.log(JSON.stringify(result2));
//     console.log(result2);
     if(result1 && result2){
       result = merge(result1, result2);
       result1.forEach(function(element){
//         element.child = merge_node_types(element.child);
	 current_node_obj.child.push(element);
       });
       result2.forEach(function(element){
//         element.child = merge_node_types(element.child);
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
  lpsl = lpsl.filter(function(element){return lvp.indexOf(element) == -1;})	//checking for cycles
  mpsl = mpsl.filter(function(element){return mvp.indexOf(element) == -1;})	//checking for cycles
  var matchable_nodes = lpsl.filter(function(element){return (element.definition.slice(0,5) != 'not::' && element.definition.slice(0,5) != 'new::');}); //extracting lhs from rule graph
  var nac_anon_nodes = lpsl.filter(function(element){return element.definition.slice(0,5) == 'not::' && element.label == "";});
  if(nac_anon_nodes.length > 0) {if (matchable_nodes.length != mpsl.length) return false;}
  else {if (matchable_nodes.length > mpsl.length) return false;}
  var nac_nodes_with_label = lpsl.filter(function(element){return element.definition.slice(0,5)=='not::' && element.label != "";});
  if(matchable_nodes.length == 0 && nac_nodes_with_label.length == 0) return [];
  if(matchable_nodes.length == 0 && nac_nodes_with_label.length != 0 && mpsl.length == 0) return [];
  var current_link_type_obj = {'type':'link_type', 'name':lt, 'child':[]};
  var non_anon_nodes = matchable_nodes.filter(function(element){return element.label != "";}),
      anon_nodes = matchable_nodes.filter(function(element){return element.label == "";}),
      anon_nodes_with_labels = [];
  var current_node_type_obj = null, current_node_obj = null, current_node = null,
      result = null, result1 = null, result2 = null,
      lhs_pred = null, lhs_succ = null, mg_pred = null, mg_succ = null, arr = null, 
      nlpsl = null, nmpsl = null, 
      nnlpsl = null, nnmpsl = null,
      combs = null, perms = null, perm = null,
      combs1 = null, perms1 = null, perm1 = null, 
      current_match_object = null, nac_nodes_of_this_type = null;
  perms1 = permutations_with_repetitions(mg.node_types, anon_nodes.length);
  for(var i=0; i<(perms1.length||1); i++){
    anon_nodes_with_labels = [];
    anon_nodes.forEach(function(element){anon_nodes_with_labels.push(extract_relevant_data(element));});	//first creating a copy of anon_nodes
    current_match_object = {'type':'match_object', 'name':i, 'child':[]};
    nnlpsl = [];
    non_anon_nodes.forEach(function(element){nnlpsl.push(element)});	//first pushing non anon nodes into the array
    if(perms1[i]) perms1[i].forEach(function(element){ 		//then pushing anon nodes with current labels
      anon_nodes_with_labels[i].label = element;
      nnlpsl.push(anon_nodes_with_labels[i])
    });
    for(var j=0; j<mg.node_types.length; j++){
      nlpsl = nnlpsl.filter(function(element){return element.label == mg.node_types[j];});
      nmpsl = mpsl.filter(function(element){return element.label == mg.node_types[j];});
      nac_nodes_of_this_type = lpsl.filter(function(element){return element.label == mg.node_types[j] && element.definition.slice(0,5) == 'not::'});
      if(nac_nodes_of_this_type.length > 0) {if(nlpsl.length != nmpsl.length) break;}
      else {if(nlpsl.length > nmpsl.length) break;}
      if(nlpsl.length == 0) continue;
      combs = combinations(nmpsl, nlpsl.length);
      perms = [];
      combs.forEach(function(element){
        perm = permutations(element);
        perm.forEach(function(local_element){ 
	  if(local_element.length) perms.push(local_element);
        });
      });
      current_node_type_obj = {'type':'node_type', 'name':mg.node_types[j], 'child':[]};
      for(var x=0; x<perms.length; x++){
        arr = [];
        for(var y=0; y<perms[x].length; y++){
          current_node = extract_relevant_data(perms[x][y]);
	  current_node.rule_index = lhs.nodes.indexOf(lhs.nodes.filter(function(element){return element.key == nlpsl[y].key;})[0]);
          current_node_obj = {'type':'node', 'name':current_node, 'child':[]};
	  lvp.push(nlpsl[y]);
	  mvp.push(perms[x][y]);
	  for(var l=0; l<lhs.link_types.length; l++){
	    lhs_pred = predecessors(lhs, nlpsl[y], lhs.link_types[l]);
	    mg_pred = predecessors(mg, perms[x][y], lhs.link_types[l]);
	    lhs_succ = successors(lhs, nlpsl[y], lhs.link_types[l]);
	    mg_succ = successors(mg, perms[x][y], lhs.link_types[l]);
	    result1 = sub_match(lhs, mg, lhs.link_types[l], lhs_pred, mg_pred, lvp, mvp);
//	    console.log(JSON.stringify(result1));
	    result2 = sub_match(lhs, mg, lhs.link_types[l], lhs_succ, mg_succ, lvp, mvp);
//	    console.log(JSON.stringify(result2));
	    if(result1 && result2){
	      result = merge(result1, result2);
	      result1.forEach(function(element){
//	        element.child = merge_node_types(element.child);
	        current_node_obj.child.push(element);
	      });
	      result2.forEach(function(element){
//	        element.child = merge_node_types(element.child);
	        current_node_obj.child.push(element);
	      });
	    }
	    else break;
	  }
	  if(l == lhs.link_types.length) arr.push(current_node_obj);
	  else break;
        }
        for(var z=y-1; z>=0; z--){
          lvp.pop();
          mvp.pop();
        }
        if(y==perms[x].length && arr.length != 0){
	  current_node_type_obj.child.push(arr);
	}
      }
      if(current_node_type_obj.child.length == 0) break;
      else current_match_object.child.push(current_node_type_obj);
    }
    if(j < mg.node_types.length) continue;
    if(current_match_object.child.length == 0) continue;
    else current_link_type_obj.child.push(current_match_object);
  }
  if(current_link_type_obj.child.length == 0) {
    return false;
  }
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
  var random_path = [], index = 0, path = [], index1 = 0;
  e.child.forEach(function(element){	//for each link type
    index1 = Math.floor(Math.random()*(element.child.length));	//for some arbitrary match object in this link type
//    console.log(element.child);
    element.child[index1].child.forEach(function(local_element){
//      local_el.child.forEach(function(local_element){	//for each node type
        index = Math.floor(Math.random()*(local_element.child.length));	//for some arbitrary child of this node type
        local_element.child[index].forEach(function(el){
          path = extract_random_path_from_element(el);
	  path.push(el.name);
	  path.forEach(function(ele){
	    random_path.push(ele);
	  });
        });
 //     });
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
//  console.log("entered merge");
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
//  console.log("entered merge node types");
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

function interpret_inductively(graph){
  var node = graph.nodes[0];
  var final_obj = {"child":[]}
  var labels = ["U", "A", "Q", "D", "US", "V"];
  var obj = {}, r1 = null, r2 = null;
  for(var i=0; i<labels.length; i++){
    obj = {"type": "node", "label": labels[i], "mg_index": node.index, "pred":[], "succ":[]};
    r1 = inductive_interpretation(graph, labels[i], predecessors(graph, node, "in"), "pred", [node]);
    r2 = inductive_interpretation(graph, labels[i], successors(graph, node, "in"), "succ", [node]);
    if(r1 && r2) {
      obj["pred"] = r1;
      obj["succ"] = r2;
      final_obj.child.push(obj);
    }
  }
  if(final_obj.child.length) return final_obj;
  else return false;
}

var inherences = {
  "pred":{"U":[], "A":["U"], "Q":["U"], "D":["U", "A", "Q", "D"], "US":["U", "A", "Q", "D", "V"], "V":[]},
  "succ":{"U":["A", "Q", "D", "US"], "A":["D", "US"], "Q":["D", "US"], "D":["D", "US"], "US":[], "V":["US"]}
}

function inductive_interpretation(graph, l, ch, rel, vp){	//graph, label, children_array, relation, visited_path
  var non_visited_children = [], perms = [], final_arr = [], arr = [], obj = {}, r1 = null, r2 = null;
  ch.forEach(function(element){if(vp.indexOf(element)==-1) non_visited_children.push(element);});
  if(non_visited_children.length == 0) return [];
  if(l == "US" && rel == "succ" && non_visited_children.length > 0) return false;
  if(l == "U" && rel == "pred" && non_visited_children.length > 0) return false;
  if(l == "V" && rel == "pred" && non_visited_children.length > 0) return false;
  if(l == "V" && rel == "succ" && non_visited_children.length > 1) return false;
  if(rel == "pred") perms = permutations_with_repetitions(inherences["pred"][l], non_visited_children.length);
  else if(rel == "succ") perms = permutations_with_repetitions(inherences["succ"][l], non_visited_children.length);
  for(var i=0; i<perms.length; i++){
    arr = [];
    for(var j=0; j<perms[i].length; j++){
      vp.push(non_visited_children[j]);
      obj = {"type":"node", "label": perms[i][j], "mg_index":non_visited_children[j].index, "pred":[], "succ":[]};
      r1 = inductive_interpretation(graph, perms[i][j], predecessors(graph, non_visited_children[j], "in"), "pred", vp);
      r2 = inductive_interpretation(graph, perms[i][j], successors(graph, non_visited_children[j], "in"), "succ", vp);
      if(r1 && r2){
        obj.pred = r1;
	obj.succ = r2;
	arr.push(obj);
      }
      else break;
    }
    for(var z=j-1; z>=0; z--) vp.pop();
    if(j == perms[i].length) final_arr.push(arr);
  }
  if(final_arr.length > 0) return final_arr;
  else return false;
}

function extract_random_interpretation(obj){
  var final_arr = [];
  var random_index = Math.floor(Math.random()*(obj.pred.length));
  var random_pred = obj.pred[random_index] || [];
  final_arr.push({"mg_index":obj.mg_index, "label":obj.label});
  random_pred.forEach(function(element){
    result = extract_random_interpretation(element);
    result.push({"mg_index":element.mg_index, "label":element.label});
    result.forEach(function(local_element){final_arr.push(local_element);});
  });
  random_index = Math.floor(Math.random()*(obj.succ.length));
  var random_succ = obj.succ[random_index] || [];
  random_succ.forEach(function(element){
    result = extract_random_interpretation(element);
    result.push({"mg_index":element.mg_index, "label":element.label});
    result.forEach(function(local_element){final_arr.push(local_element);});
  });
  return final_arr;
}
