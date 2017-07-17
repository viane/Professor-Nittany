'use strict';

var watson = require('watson-developer-cloud');

var dialog_stack = ["root"],
    dialog_turn_counter = 1,
    dialog_request_counter = 1;

var conversation = watson.conversation({ username: '2b2e38a3-e4b9-4602-a9eb-8be58f235fca', password: 'YXyHpjWJXbLf', version: 'v1', version_date: '2016-07-11' });

exports.isInDomain = function (inputText) {
    return new Promise(function (resolve, reject) {
        conversation.message({
            input: {
                "text": inputText
            },
            context: {
                "conversation_id": "1",
                "system": {
                    "dialog_stack": dialog_stack,
                    "dialog_turn_counter": dialog_turn_counter,
                    "dialog_request_counter": dialog_request_counter
                }
            },
            workspace_id: '67c7c32c-453d-47b5-b942-2f1ee76ffa77'
        }, function (err, response) {
            if (err) {
                console.error('error:', err);
                reject(err);
            } else {
                //update dialog path
                dialog_stack = response.context.system.dialog_stack;
                dialog_turn_counter = response.context.system.dialog_turn_counter;
                dialog_request_counter = response.context.system.dialog_request_counter;
                //handling answer part
                resolve(response.output.text);
            }
        });
    });
};

exports.askSEWorldCampusSchedule = function (inputText) {
    return new Promise(function (resolve, reject) {
        conversation.message({
            input: {
                "text": inputText
            },
            context: {
                "conversation_id": "1",
                "system": {
                    "dialog_stack": dialog_stack,
                    "dialog_turn_counter": dialog_turn_counter,
                    "dialog_request_counter": dialog_request_counter
                }
            },
            workspace_id: 'f1398377-2d99-4f4a-88aa-91ad8730fe59'
        }, function (err, response) {
            if (err) {
                console.error('error:', err);
                reject(err);
            } else {
                //update dialog path
                dialog_stack = response.context.system.dialog_stack;
                dialog_turn_counter = response.context.system.dialog_turn_counter;
                dialog_request_counter = response.context.system.dialog_request_counter;
                //handling answer part
                resolve(response.output.text);
            }
        });
    });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zeXN0ZW0vd2F0c29uL2NvbnZlcnNhdGlvbi5qcyJdLCJuYW1lcyI6WyJ3YXRzb24iLCJyZXF1aXJlIiwiZGlhbG9nX3N0YWNrIiwiZGlhbG9nX3R1cm5fY291bnRlciIsImRpYWxvZ19yZXF1ZXN0X2NvdW50ZXIiLCJjb252ZXJzYXRpb24iLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwidmVyc2lvbiIsInZlcnNpb25fZGF0ZSIsImV4cG9ydHMiLCJpc0luRG9tYWluIiwiaW5wdXRUZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJtZXNzYWdlIiwiaW5wdXQiLCJjb250ZXh0Iiwid29ya3NwYWNlX2lkIiwiZXJyIiwicmVzcG9uc2UiLCJjb25zb2xlIiwiZXJyb3IiLCJzeXN0ZW0iLCJvdXRwdXQiLCJ0ZXh0IiwiYXNrU0VXb3JsZENhbXB1c1NjaGVkdWxlIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxJQUFNQSxTQUFTQyxRQUFRLHdCQUFSLENBQWY7O0FBRUEsSUFBSUMsZUFBZSxDQUFDLE1BQUQsQ0FBbkI7QUFBQSxJQUNJQyxzQkFBc0IsQ0FEMUI7QUFBQSxJQUVJQyx5QkFBeUIsQ0FGN0I7O0FBSUEsSUFBTUMsZUFBZUwsT0FBT0ssWUFBUCxDQUFvQixFQUFDQyxVQUFVLHNDQUFYLEVBQW1EQyxVQUFVLGNBQTdELEVBQTZFQyxTQUFTLElBQXRGLEVBQTRGQyxjQUFjLFlBQTFHLEVBQXBCLENBQXJCOztBQUVBQyxRQUFRQyxVQUFSLEdBQXFCLFVBQUNDLFNBQUQsRUFBYztBQUMvQixXQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBb0I7QUFDbkNWLHFCQUFhVyxPQUFiLENBQXFCO0FBQ2pCQyxtQkFBTztBQUNILHdCQUFRTDtBQURMLGFBRFU7QUFJakJNLHFCQUFTO0FBQ0wsbUNBQW1CLEdBRGQ7QUFFTCwwQkFBVTtBQUNOLG9DQUFnQmhCLFlBRFY7QUFFTiwyQ0FBdUJDLG1CQUZqQjtBQUdOLDhDQUEwQkM7QUFIcEI7QUFGTCxhQUpRO0FBWWpCZSwwQkFBYztBQVpHLFNBQXJCLEVBYUcsVUFBU0MsR0FBVCxFQUFjQyxRQUFkLEVBQXdCO0FBQ3ZCLGdCQUFJRCxHQUFKLEVBQVM7QUFDTEUsd0JBQVFDLEtBQVIsQ0FBYyxRQUFkLEVBQXdCSCxHQUF4QjtBQUNBTCx1QkFBT0ssR0FBUDtBQUNILGFBSEQsTUFHTztBQUNIO0FBQ0FsQiwrQkFBZW1CLFNBQVNILE9BQVQsQ0FBaUJNLE1BQWpCLENBQXdCdEIsWUFBdkM7QUFDQUMsc0NBQXNCa0IsU0FBU0gsT0FBVCxDQUFpQk0sTUFBakIsQ0FBd0JyQixtQkFBOUM7QUFDQUMseUNBQXlCaUIsU0FBU0gsT0FBVCxDQUFpQk0sTUFBakIsQ0FBd0JwQixzQkFBakQ7QUFDQTtBQUNBVSx3QkFBUU8sU0FBU0ksTUFBVCxDQUFnQkMsSUFBeEI7QUFDSDtBQUNKLFNBekJEO0FBMEJILEtBM0JNLENBQVA7QUE0QkgsQ0E3QkQ7O0FBK0JBaEIsUUFBUWlCLHdCQUFSLEdBQW1DLFVBQUNmLFNBQUQsRUFBYztBQUM3QyxXQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBb0I7QUFDbkNWLHFCQUFhVyxPQUFiLENBQXFCO0FBQ2pCQyxtQkFBTztBQUNILHdCQUFRTDtBQURMLGFBRFU7QUFJakJNLHFCQUFTO0FBQ0wsbUNBQW1CLEdBRGQ7QUFFTCwwQkFBVTtBQUNOLG9DQUFnQmhCLFlBRFY7QUFFTiwyQ0FBdUJDLG1CQUZqQjtBQUdOLDhDQUEwQkM7QUFIcEI7QUFGTCxhQUpRO0FBWWpCZSwwQkFBYztBQVpHLFNBQXJCLEVBYUcsVUFBU0MsR0FBVCxFQUFjQyxRQUFkLEVBQXdCO0FBQ3ZCLGdCQUFJRCxHQUFKLEVBQVM7QUFDTEUsd0JBQVFDLEtBQVIsQ0FBYyxRQUFkLEVBQXdCSCxHQUF4QjtBQUNBTCx1QkFBT0ssR0FBUDtBQUNILGFBSEQsTUFHTztBQUNIO0FBQ0FsQiwrQkFBZW1CLFNBQVNILE9BQVQsQ0FBaUJNLE1BQWpCLENBQXdCdEIsWUFBdkM7QUFDQUMsc0NBQXNCa0IsU0FBU0gsT0FBVCxDQUFpQk0sTUFBakIsQ0FBd0JyQixtQkFBOUM7QUFDQUMseUNBQXlCaUIsU0FBU0gsT0FBVCxDQUFpQk0sTUFBakIsQ0FBd0JwQixzQkFBakQ7QUFDQTtBQUNBVSx3QkFBUU8sU0FBU0ksTUFBVCxDQUFnQkMsSUFBeEI7QUFDSDtBQUNKLFNBekJEO0FBMEJILEtBM0JNLENBQVA7QUE0QkgsQ0E3QkQiLCJmaWxlIjoiY29udmVyc2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHdhdHNvbiA9IHJlcXVpcmUoJ3dhdHNvbi1kZXZlbG9wZXItY2xvdWQnKTtcblxubGV0IGRpYWxvZ19zdGFjayA9IFtcInJvb3RcIl0sXG4gICAgZGlhbG9nX3R1cm5fY291bnRlciA9IDEsXG4gICAgZGlhbG9nX3JlcXVlc3RfY291bnRlciA9IDE7XG5cbmNvbnN0IGNvbnZlcnNhdGlvbiA9IHdhdHNvbi5jb252ZXJzYXRpb24oe3VzZXJuYW1lOiAnMmIyZTM4YTMtZTRiOS00NjAyLWE5ZWItOGJlNThmMjM1ZmNhJywgcGFzc3dvcmQ6ICdZWHlIcGpXSlhiTGYnLCB2ZXJzaW9uOiAndjEnLCB2ZXJzaW9uX2RhdGU6ICcyMDE2LTA3LTExJ30pO1xuXG5leHBvcnRzLmlzSW5Eb21haW4gPSAoaW5wdXRUZXh0KT0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT57XG4gICAgICAgIGNvbnZlcnNhdGlvbi5tZXNzYWdlKHtcbiAgICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICAgICAgXCJ0ZXh0XCI6IGlucHV0VGV4dFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICBcImNvbnZlcnNhdGlvbl9pZFwiOiBcIjFcIixcbiAgICAgICAgICAgICAgICBcInN5c3RlbVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiZGlhbG9nX3N0YWNrXCI6IGRpYWxvZ19zdGFjayxcbiAgICAgICAgICAgICAgICAgICAgXCJkaWFsb2dfdHVybl9jb3VudGVyXCI6IGRpYWxvZ190dXJuX2NvdW50ZXIsXG4gICAgICAgICAgICAgICAgICAgIFwiZGlhbG9nX3JlcXVlc3RfY291bnRlclwiOiBkaWFsb2dfcmVxdWVzdF9jb3VudGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtzcGFjZV9pZDogJzY3YzdjMzJjLTQ1M2QtNDdiNS1iOTQyLTJmMWVlNzZmZmE3NydcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyLCByZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yOicsIGVycik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vdXBkYXRlIGRpYWxvZyBwYXRoXG4gICAgICAgICAgICAgICAgZGlhbG9nX3N0YWNrID0gcmVzcG9uc2UuY29udGV4dC5zeXN0ZW0uZGlhbG9nX3N0YWNrO1xuICAgICAgICAgICAgICAgIGRpYWxvZ190dXJuX2NvdW50ZXIgPSByZXNwb25zZS5jb250ZXh0LnN5c3RlbS5kaWFsb2dfdHVybl9jb3VudGVyO1xuICAgICAgICAgICAgICAgIGRpYWxvZ19yZXF1ZXN0X2NvdW50ZXIgPSByZXNwb25zZS5jb250ZXh0LnN5c3RlbS5kaWFsb2dfcmVxdWVzdF9jb3VudGVyO1xuICAgICAgICAgICAgICAgIC8vaGFuZGxpbmcgYW5zd2VyIHBhcnRcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLm91dHB1dC50ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydHMuYXNrU0VXb3JsZENhbXB1c1NjaGVkdWxlID0gKGlucHV0VGV4dCk9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+e1xuICAgICAgICBjb252ZXJzYXRpb24ubWVzc2FnZSh7XG4gICAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgICAgIFwidGV4dFwiOiBpbnB1dFRleHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgXCJjb252ZXJzYXRpb25faWRcIjogXCIxXCIsXG4gICAgICAgICAgICAgICAgXCJzeXN0ZW1cIjoge1xuICAgICAgICAgICAgICAgICAgICBcImRpYWxvZ19zdGFja1wiOiBkaWFsb2dfc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgIFwiZGlhbG9nX3R1cm5fY291bnRlclwiOiBkaWFsb2dfdHVybl9jb3VudGVyLFxuICAgICAgICAgICAgICAgICAgICBcImRpYWxvZ19yZXF1ZXN0X2NvdW50ZXJcIjogZGlhbG9nX3JlcXVlc3RfY291bnRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3b3Jrc3BhY2VfaWQ6ICdmMTM5ODM3Ny0yZDk5LTRmNGEtODhhYS05MWFkODczMGZlNTknXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdlcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL3VwZGF0ZSBkaWFsb2cgcGF0aFxuICAgICAgICAgICAgICAgIGRpYWxvZ19zdGFjayA9IHJlc3BvbnNlLmNvbnRleHQuc3lzdGVtLmRpYWxvZ19zdGFjaztcbiAgICAgICAgICAgICAgICBkaWFsb2dfdHVybl9jb3VudGVyID0gcmVzcG9uc2UuY29udGV4dC5zeXN0ZW0uZGlhbG9nX3R1cm5fY291bnRlcjtcbiAgICAgICAgICAgICAgICBkaWFsb2dfcmVxdWVzdF9jb3VudGVyID0gcmVzcG9uc2UuY29udGV4dC5zeXN0ZW0uZGlhbG9nX3JlcXVlc3RfY291bnRlcjtcbiAgICAgICAgICAgICAgICAvL2hhbmRsaW5nIGFuc3dlciBwYXJ0XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5vdXRwdXQudGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuIl19