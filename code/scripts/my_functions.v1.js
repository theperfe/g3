/* Todos
- change node types array later
*/

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
//    if(typeof comb[0] == "number") large_arr.push(comb);
   // else 
    large_arr = large_arr.concat(comb);
    var comb = combinations(l.slice(1), r-1);
/*    if(comb.length == 0) {
    large_arr.push([l[0]]);
    }
    */
    for(var c=0; c<comb.length; c++){
     var arr = [];
     arr.push(l[0]);
     arr = arr.concat(comb[c]);
     large_arr.push(arr);
    }
    return large_arr;
  }
}

/*
var node_types = ["E"];  //to store the node types and display them in selection panel

function match_old(graph1, graph2){		//lhs, main_graph //to be deleted later
  var result = sub_match(graph1, graph2, graph1.nodes, graph2.nodes, [],[]);
  if(result[0] === true) console.log("Yes, they match");
  else console.log("No match found");
}

function sub_match_old(lhs, mg, lpsl, mpsl, lvp, mvp){	//lhs, main_graph, lhs predecessor/successor nodes, main graph predecessor/successor nodes, lhs visited path, main graph visited path. //to be deleted later
    if(lpsl == []) return [true, []];
    else if(lpsl.length >= mpsl.length) return [false, []];
    var possible_paths = [];
    for(m=0; m<node_types.length; m++){
      var current_elements = lpsl.filter(function(element){return element.label == node_types[m]});
      var nlpsl = [];	//new lpsl of type m which are not visited earlier
      for(i=0; i<current_elements.length; i++){
        if(lvp.indexOf(current_elements[i]) == -1) nlpsl.push(current_elements[i]);
      }
      current_elements = mpsl.filter(function(element){return element.label == node_types[m]});
      var nmpsl = [];	//new mpsl of type m which are not visited earlier
      for(i=0; i<current_elements.length; i++){
        if(lvp.indexOf(current_elements[i]) == -1) nmpsl.push(current_elements[i]);
      }
      //generating a permutation of nPr elements where n=length of nmpsl, r=length of lmpsl;
      //first generating combinations of cPr elements
      var combs = combinations(nmpsl, nlpsl.length);
      var perms = [];
      for(var i=0; i<combs.length; i++){
        var perm = permutations(combs[i]);
	for(var j=0; j<perm.length; j++) perms.push(perm[j]);
      }
      for(var i=0; i<perms.length; i++){
        var arr = [];
        for(var j=0; j<perms[i].length; j++){
	  lvp.push(nlpsl[j]);
	  mvp.push(perms[i][j]);
	  arr.push(perms[i][j]);
	  result1 = sub_match(lhs, mg, lhs.predecessors(perms[i][j]), mg.predecessors(perms[i][j]), lvp, mvp);
	  result2 = sub_match(lhs, mg, lhs.successors(perms[i][j]), mg.successors(perms[i][j]), lvp, mvp);
	  if(result1[0] == true && result2[0] ==  true) arr.push(result1[1].concat(result2[1]));
	  else break;
	}
	if(j==perms[i].length) possible_paths.push(arr);
      }
      if(i==0) return [true, possible_paths];
      else if(possible_paths != [[]]) return [true, possible_paths];
      else return [false, []];
    }
} 
*/

function match(graph1, graph2){
  var current_node_type = null;
  if(graph1.nodes.length > 1) current_node_type = graph1.nodes[0].label;
  var possible_matching_nodes = graph2.nodes.filter(function(element){return element.label == current_node_type});
  var all_matches = {'child':[]};
  var result1 = null, result2 = null, result = null;
  possible_matching_nodes.forEach(function(element){
//    console.log(element);
    var link_types_obj_arr = [];
    var results_arr = [];
    graph1.link_types.forEach(function(local_element){
      result1 = sub_match(graph1, graph2, predecessors(graph1, graph1.nodes[0], local_element), predecessors(graph2, element, local_element), [graph1.nodes[0]], [element])
      result2 = sub_match(graph1, graph2, successors(graph1, graph1.nodes[0], local_element), successors(graph2, element, local_element), [graph1.nodes[0]], [element])
//      console.log(result1);
//      console.log(result2);
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
	var current_node = {'name':element, 'child':[]};
	final_result.forEach(function(local_element){
	  current_node.child.push(local_element);
	});
	all_matches.child.push(current_node);
     }
  });
  return all_matches;
}

function sub_match(lhs, mg, lpsl, mpsl, lvp, mvp){	//lhs, main_graph, lhs predecessor/successor nodes, main graph predecessor/successor nodes, lhs visited path, main graph visited path.
/*  console.log(lhs);
  console.log(mg);
  console.log(lpsl);
  console.log(mpsl);
  console.log(lvp);
  console.log(mvp);
  */
  if(lpsl.length == 0) return [];
  else if(lpsl.length > mpsl.length) return false;
//  console.log("entered");
  var result1 = null, result2 = null;
  var link_types_obj_arr = [];
  for(var i=0; i<lhs.link_types.length; i++){
    var current_link_type_obj = {'name': lhs.link_types[i], 'child':[]};
    for(var j=0; j<lhs.node_types.length; j++){
      var current_node_type_obj = {'name': lhs.node_types[j], 'child':[]};
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
//      console.log(combs);
      var perms = [];
      combs.forEach(function(element){
        perm = permutations(element);
	perm.forEach(function(local_element){
	  perms.push(local_element);
	});
      });
//      console.log(perms);
      for(var x=0; x<perms.length; x++){
//        console.log(perms[x]);
	var arr = [];
        for(var y=0; y<perms[x].length; y++){
	  lvp.push(nlpsl[y]);
	  mvp.push(perms[x][y]);
	  var current_node_obj = {'name':perms[x][y], 'child':[]};
	      console.log(JSON.stringify(current_node_obj));
	  result1 = sub_match(lhs, mg, predecessors(lhs, nlpsl[y], lhs.link_types[i]), predecessors(mg, perms[x][y], lhs.link_types[i]), lvp, mvp);
	  result2 = sub_match(lhs, mg, successors(lhs, nlpsl[y], lhs.link_types[i]), successors(mg, perms[x][y], lhs.link_types[i]), lvp, mvp);
//	  console.log(JSON.stringify(result1));
//	  console.log(JSON.stringify(result2));
	  if(result1 && result2) {
	    result = merge(result1, result2);
	    console.log(JSON.stringify(result));
	    result.forEach(function(element){
	      console.log(JSON.stringify(current_node_obj));
	      current_node_obj.child.push(element);
	      console.log(JSON.stringify(current_node_obj));
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
    link_types_obj_arr.push(current_link_type_obj);
  }
//  console.log(link_types_obj_arr);
  return link_types_obj_arr;
}


function predecessors(graph, node, link_type){
//  console.log(node);
  var result = [];
  for(var i=0; i<graph.links.length; i++){
//    console.log(graph.links[i]);
    if(graph.nodes[graph.links[i].target].key == node.key && graph.links[i].label == link_type) result.push(graph.nodes[graph.links[i].source]);
  }
//  console.log(result);
  return result;
}

function successors(graph, node, link_type){
  var result = [];
  for(var i=0; i<graph.links.length; i++){
    if(graph.nodes[graph.links[i].source].key == node.key && graph.links[i].label == link_type) result.push(graph.nodes[graph.links[i].target]);
  }
  return result;
}

function merge(arr1, arr2){
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
