
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
/*Assumptions:
- Each of the graphs can be disconnected graphs. 
- For LHS, the no. of disconnected subgraphs and the keys of representative nodes of each of them are taken from the user. None of these nodes can have 'not:' or 'new:' in them.
*/


  //to store all the matches of graph1 (lhs) in graph2 (mg) in an array of arrays. The child attribute here is a list of lists of node objects where each node object is a match with one of the lhs nodes. Each node obj is like a tree with further children in it.
  var all_matches = {'type':'root_node', 'name':'root', 'child':[]};
  var representative_nodes_list_typewise = [], temp_arr = [], lhs_temp_arr = [], mg_temp_arr = [], combs = [], perm = [], perms = [], mega_perms = [[]];

  for(var i=0; i<graph1.node_types.length; i++){ //by the end of this loop, you will get all possible permutations of matching nodes of mg with the representative nodes of LHS.
    lhs_temp_arr = graph1.nodes.filter(function(element){return (element.label == graph1.node_types[i] && (element.key in graph1.representative_nodes_list));});
    representative_nodes_list_typewise = representative_nodes_list_typewise.concat(lhs_temp_arr);
    // get first combs, and then perms, of nodes of the same type from mg 
    mg_temp_arr = graph2.nodes.filter(function(element){return element.label == graph1.node_types[i];});
    if(mg_temp_arr.length < lhs_temp_arr.length) return all_matches;
    else {
      combs = combinations(mg_temp_arr, lhs_temp_arr.length);
      perms = [];
      combs.forEach(function(element){
        perm = permutations(element);
        perm.forEach(function(local_element){ 
	  if(local_element.length) perms.push(local_element);
        });
      });
    }
    mega_perms = cartesian_product(mega_perms, perms);
//    console.log(JSON.stringify(temp_arr));
  }


  //result1 is to store the result from predecessors; result2 from successors; result to combine these two into one
  var result1 = null, result2 = null, result = null;

  //current_node is only for storing the node data. This current_node and its children (which are matching with that of lhs) will be stored in current_node_obj which itself will be one of the children for its parent node.
  var current_node_obj = null, current_node = null, lvp = null, mvp = null;

  for(var i=0; i<mega_perms.length; i++){
    temp_arr = [];
    for(var p=0; p<mega_perms[i].length; p++){
     current_node = extract_relevant_data_from_node(mega_perms[i][p]);
     current_node.rule_index = representative_nodes_list_typewise[p].key;	//rule_index refers to the key of the node in the rule graph with which this node is matching.
     current_node_obj = {'type':'node', 'name':current_node, 'child':[]};
     lvp.push(representative_nodes_list_typewise[p]);
     mvp.push(mega_perms[i][p]);
     for(var q=0; q<graph1.link_types.length; q++){	//for a given link type
       result1 = sub_match(graph1, graph2, graph1.link_types[q], predecessors(graph1, representative_nodes_list_typewise[p], graph1.link_types[q]), predecessors(graph2, mega_perms[i][p], graph1.link_types[q]), representative_nodes_list_typewise, mega_perms[i]);
//       console.log(result1);
//  	    console.log(JSON.stringify(result1));
       result2 = sub_match(graph1, graph2, graph1.link_types[q], successors(graph1, representative_nodes_list_typewise[p], graph1.link_types[q]), successors(graph2, mega_perms[i][p], graph1.link_types[q]), representative_nodes_list_typewise, mega_perms[i]);
//  	    console.log(JSON.stringify(result2));
//       console.log(result2);
       if(result1 && result2){
//         console.log(JSON.stringify(result1));
//         console.log(JSON.stringify(result2));
         result = merge(result1, result2);
//         console.log(JSON.stringify(result));
         result1.forEach(function(element){
//           element.child = merge_node_types(element.child);
	   current_node_obj.child.push(element);
         });
         result2.forEach(function(element){
//           element.child = merge_node_types(element.child);
	   current_node_obj.child.push(element);
         });
       }
       else break;
     }
     if(q == graph1.link_types.length) temp_arr.push(current_node_obj);	
     else break;
    }
    if(p==mega_perms[i].length && temp_arr.length!=0){
      all_matches.child.push(temp_arr);
    }
  }
  console.log(JSON.stringify(all_matches));
  return all_matches;
}

function sub_match(lhs, mg, lt, lpsl, mpsl, lvp, mvp){	//lhs, main_graph, link type, lhs pred succ list, mg pred succ list, lhs visited path, mg visited path
//  console.log("entered sub match");
  //console.log(JSON.stringify(lvp.length));
  if(lpsl.length == 0) return [];

  //To avoid cycles in LHS matching with non-cycles in main graph
  rlpsl = lpsl.filter(function(element){return lvp.indexOf(element) != -1;})    //repeating nodes in lpsl
  rmpsl = mpsl.filter(function(element){return mvp.indexOf(element) != -1;})    //repeating nodes in mpsl
  //console.log(rmpsl.length);
  if(rlpsl.length > rmpsl.length) return false;
  else {
    for(var i=0; i<mg.node_types.length; i++){
	   rlpslt = rlpsl.filter(function(element){return element.label == mg.node_types[i];});      //extracting nodes of a particular type
	   rmpslt = rmpsl.filter(function(element){return element.label == mg.node_types[i];});      //extracting nodes of a particular type
	   if(rlpslt.length > rmpslt.length) return false;
    }
  }

  //The visited nodes are handled. Now working with the unvisited nodes.
  lpsl = lpsl.filter(function(element){return lvp.indexOf(element) == -1;})	//excluding visited nodes to avoid infinite regress
  mpsl = mpsl.filter(function(element){return mvp.indexOf(element) == -1;})	//excluding visited nodes to avoid infinite regress
  var matchable_nodes = lpsl.filter(function(element){return (element.definition.slice(0,5) != 'not::' && element.definition.slice(0,5) != 'new::');}); //extracting lhs from rule graph
  //console.log(JSON.stringify(matchable_nodes));
  if (matchable_nodes.length > mpsl.length) return false;	
  if(matchable_nodes.length == 0) return [];	//keep only the first part
  var current_link_type_obj = {'type':'link_type', 'name':lt, 'child':[]};
  var non_anon_nodes = matchable_nodes.filter(function(element){return element.label != "";}),
      anon_nodes = matchable_nodes.filter(function(element){return element.label == "";}),
      anon_nodes_test_array = null, //to retrieve the anonymous node even after assigning a label to it
      anon_nodes_with_labels = [];	//to store copy of anon_nodes after assigning them some label. Without this, matching cannot be done.
//      console.log(JSON.stringify(anon_nodes));
  var current_node_type_obj = null, current_node_obj = null, current_node = null,
      result = null, result1 = null, result2 = null,
      lhs_pred = null, lhs_succ = null, mg_pred = null, mg_succ = null, arr = null, 
      nlpsl = null, nmpsl = null, 
      nnlpsl = null, nnmpsl = null,
      combs = null, perms = null, perm = null,
      combs1 = null, perms1 = null, perm1 = null, 
      current_match_object = null; 
  perms1 = permutations_with_repetitions(mg.node_types, anon_nodes.length);
  for(var i=0; i<(perms1.length||1); i++){  //for each of the permutation/combination of anonymous nodes
    anon_nodes_with_labels = [];
    anon_nodes.forEach(function(element){anon_nodes_with_labels.push(extract_relevant_data_from_node(element));});	//first creating a copy of anon_nodes
    //console.log(JSON.stringify(anon_nodes_with_labels));
    current_match_object = {'type':'match_object', 'name':i, 'child':[]};
    nnlpsl = [];
    non_anon_nodes.forEach(function(element){nnlpsl.push(element)});	//first pushing non anon nodes into the array
    if(perms1[i]){
      for(var j=0; j<anon_nodes_with_labels.length; j++){	//then pushing anon nodes with current labels
        anon_nodes_with_labels[j].label = perms1[i][j];
    	//console.log(JSON.stringify(anon_nodes_with_labels[j]));
	nnlpsl.push(anon_nodes_with_labels[j]);
      }
//      console.log(JSON.stringify(anon_nodes));
    }
//    console.log(JSON.stringify(nnlpsl));
    for(var j=0; j<mg.node_types.length; j++){  //for each of the node types
      nlpsl = nnlpsl.filter(function(element){return element.label == mg.node_types[j];});   //extract all lhs nodes of this type
      nmpsl = mpsl.filter(function(element){return element.label == mg.node_types[j];});   //extract all mg nodes of this type
      if(nlpsl.length > nmpsl.length) break;	
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
      for(var x=0; x<perms.length; x++){ //for each of the permutation/combination of nodes of the given node type
        arr = [];
        for(var y=0; y<perms[x].length; y++){ //for each of the nodes in the given permutation/combination
          current_node = extract_relevant_data_from_node(perms[x][y]);	//is it necessary to store so much info of a node?
	  current_node.rule_index = lhs.nodes.indexOf(lhs.nodes.filter(function(element){return element.key == nlpsl[y].key;})[0]);	
          current_node_obj = {'type':'node', 'name':current_node, 'child':[]};
	  anon_nodes_test_array = anon_nodes.filter(function(element){return element.key == nlpsl[y].key;});
	  if(anon_nodes_test_array.length == 0) lvp.push(nlpsl[y]);
	  else lvp.push(anon_nodes_test_array[0]);
	  mvp.push(perms[x][y]);
	  for(var l=0; l<lhs.link_types.length; l++){ //for each of the link types
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
//    else current_link_type_obj.child.push(current_match_object.child);
    else current_match_object.child.forEach(function(element){current_link_type_obj.child.push(element)});
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
    if((graph.links[i].definition != undefined) && (graph.links[i].definition.slice(0,5) == 'new::')) continue;
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
    if((graph.links[i].definition != undefined) && (graph.links[i].definition.slice(0,5) == 'new::')) continue;
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

function extract_all_matches(obj){
  var final_arr = [], arr = [];
  obj.child.forEach(function(element){
    arr = extract_all_matches_recursively(element);
    arr.forEach(function(local_element){final_arr.push(local_element);});
  });
  return final_arr;
}

function extract_all_matches_recursively(obj){
  var node_type_level = [], node_level = [], link_type_level = [], obj_level = [[]];
  obj.child.forEach(function(el){	//for each link type
    //get the cartesian product of all the node types in it
    link_type_level = [[]];
    el.child.forEach(function(el2){ 	//for each node type
      node_type_level = [];
      el2.child.forEach(function(el3){	 //for each array of nodes in each node type
        temp_arr = [[]];
	el3.forEach(function(el4){	//for each node in a given array of nodes
          temp_arr = cartesian_product(temp_arr, extract_all_matches_recursively(el4));
	});
        temp_arr.forEach(function(el4){node_type_level.push(el4)});
      });
      link_type_level = cartesian_product(link_type_level, node_type_level);
    });
    //then multiply this with the next link type
    obj_level = cartesian_product(obj_level, link_type_level);
  });
  obj_level.forEach(function(el){el.push(obj.name)});
  return obj_level;
}

function extract_relevant_data_from_node(node){
  var new_node = {};
  new_node.key = node.key;
  new_node.label = node.label;
//  new_node.definition = node.definition;
//  new_node.name = node.name;
//  new_node.color = node.color;
//  new_node.width = node.width;
//  new_node.height = node.height;
//  new_node.visible_label = node.visible_label;
  return new_node;
}

function extract_relevant_data_from_link(link){		
  var new_link = {};
  new_link.key = link.key;
//  new_link.definition = link.definition;
//  new_link.color = link.color;
  new_link.label = link.label;
//  new_link.marker_id = link.marker_id;
//  new_link.source = (typeof link.source == "object" ? link.source.index : link.source);
//  new_link.target = (typeof link.target == "object" ? link.target.index : link.target);
//  new_link.visible_label = link.visible_label;
}

function interpret_inductively(graph){
  var node = graph.nodes[0];
  var final_obj = {"child":[]}
  var labels = ["U", "A", "Q", "Sw", "V", "US"];
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
  "pred":{"U":[], "A":["U"], "Q":["U"], "Sw":["U", "A", "Q"], "US":["U", "A", "Q", "Sw", "V"], "V":[]},
  "succ":{"U":["A", "Q", "Sw", "US"], "A":["Sw", "US"], "Q":["Sw", "US"], "Sw":["US"], "US":[], "V":["US"]}
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

function extract_all_interpretations(obj, mg){
  var final_arr = [], arr = [], interim_arr = [];
  for(var i=0; i<mg.nodes.length; i++){
    interim_arr.push({"mg_index":i,"label":"E"});
  }
  final_arr.push(interim_arr);		//initializing final_arr with an element which is an array of all E's.
  obj.child.forEach(function(element){
    arr = extract_all_interpretations_recursively(element);
    arr.forEach(function(local_element){final_arr.push(local_element);});
  });
  return final_arr;
}

function extract_all_interpretations_recursively(obj){
  var arr = [], pred_arr = [], succ_arr = [], parr = [], sarr = [];
  obj.pred.forEach(function(element){
    pred_arr = [[]];
    element.forEach(function(local_element){
      pred_arr = cartesian_product(pred_arr, extract_all_interpretations_recursively(local_element));
    });
    pred_arr.forEach(function(local_element){parr.push(local_element);});
  });
  obj.succ.forEach(function(element){
    succ_arr = [[]];
    element.forEach(function(local_element){
      succ_arr = cartesian_product(succ_arr, extract_all_interpretations_recursively(local_element));
    });
    succ_arr.forEach(function(local_element){sarr.push(local_element);});
    console.log(JSON.stringify(sarr));
  });
  arr = cartesian_product(parr, sarr);
  arr.forEach(function(element){element.push({"label":obj.label, "mg_index":obj.mg_index});});
  if(arr.length == 0){
    arr[0] = [];
    arr[0].push({"label":obj.label, "mg_index":obj.mg_index});
  }
  return arr;
}

function cartesian_product(a1, a2){	//each argument is an array of arrays, and the output is one single array of arrays.
  if(a1.length == 0 || (a1.length == 1 && a1[0].length == 0)) return a2;
  if(a2.length == 0 || (a2.length == 1 && a2[0].length == 0)) return a1;
  var final_arr = [];
  a1.forEach(function(element){
    a2.forEach(function(local_element){
      final_arr.push(element.concat(local_element));
    });
  });
  return final_arr;
}
