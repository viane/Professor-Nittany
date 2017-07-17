'use strict';
//////////////////////////////////////////
// remove duplicate in array
//////////////////////////////////////////

module.exports.arrayUnique = function (array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) a.splice(j--, 1);
        }
    }
    return a;
};

//////////////////////////////////////////
// return index of element from Object array
//////////////////////////////////////////

module.exports.findIndexByKeyValue = function (arraytosearch, key, valuetosearch) {
    for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i][key] == valuetosearch) {
            return i;
        }
    }
    return null;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zeXN0ZW0vdXRpbGl0eS9hcnJheS5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiYXJyYXlVbmlxdWUiLCJhcnJheSIsImEiLCJjb25jYXQiLCJpIiwibGVuZ3RoIiwiaiIsInNwbGljZSIsImZpbmRJbmRleEJ5S2V5VmFsdWUiLCJhcnJheXRvc2VhcmNoIiwia2V5IiwidmFsdWV0b3NlYXJjaCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUFBLE9BQU9DLE9BQVAsQ0FBZUMsV0FBZixHQUE2QixVQUFDQyxLQUFELEVBQVc7QUFDcEMsUUFBSUMsSUFBSUQsTUFBTUUsTUFBTixFQUFSO0FBQ0EsU0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLEVBQUVHLE1BQXRCLEVBQThCLEVBQUVELENBQWhDLEVBQW1DO0FBQy9CLGFBQUssSUFBSUUsSUFBSUYsSUFBSSxDQUFqQixFQUFvQkUsSUFBSUosRUFBRUcsTUFBMUIsRUFBa0MsRUFBRUMsQ0FBcEMsRUFBdUM7QUFDbkMsZ0JBQUlKLEVBQUVFLENBQUYsTUFBU0YsRUFBRUksQ0FBRixDQUFiLEVBQ0lKLEVBQUVLLE1BQUYsQ0FBU0QsR0FBVCxFQUFjLENBQWQ7QUFDSDtBQUNKO0FBQ0wsV0FBT0osQ0FBUDtBQUNILENBVEQ7O0FBV0E7QUFDQTtBQUNBOztBQUVBSixPQUFPQyxPQUFQLENBQWVTLG1CQUFmLEdBQXFDLFVBQUNDLGFBQUQsRUFBZ0JDLEdBQWhCLEVBQXFCQyxhQUFyQixFQUF1QztBQUN4RSxTQUFLLElBQUlQLElBQUksQ0FBYixFQUFnQkEsSUFBSUssY0FBY0osTUFBbEMsRUFBMENELEdBQTFDLEVBQStDO0FBQzNDLFlBQUlLLGNBQWNMLENBQWQsRUFBaUJNLEdBQWpCLEtBQXlCQyxhQUE3QixFQUE0QztBQUN4QyxtQkFBT1AsQ0FBUDtBQUNIO0FBQ0o7QUFDRCxXQUFPLElBQVA7QUFDSCxDQVBEIiwiZmlsZSI6ImFycmF5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyByZW1vdmUgZHVwbGljYXRlIGluIGFycmF5XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubW9kdWxlLmV4cG9ydHMuYXJyYXlVbmlxdWUgPSAoYXJyYXkpID0+IHtcbiAgICBsZXQgYSA9IGFycmF5LmNvbmNhdCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7ICsraSkge1xuICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBhLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICBpZiAoYVtpXSA9PT0gYVtqXSlcbiAgICAgICAgICAgICAgICBhLnNwbGljZShqLS0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgcmV0dXJuIGE7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcmV0dXJuIGluZGV4IG9mIGVsZW1lbnQgZnJvbSBPYmplY3QgYXJyYXlcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5tb2R1bGUuZXhwb3J0cy5maW5kSW5kZXhCeUtleVZhbHVlID0gKGFycmF5dG9zZWFyY2gsIGtleSwgdmFsdWV0b3NlYXJjaCkgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXl0b3NlYXJjaC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXl0b3NlYXJjaFtpXVtrZXldID09IHZhbHVldG9zZWFyY2gpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuIl19