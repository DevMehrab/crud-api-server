import http from "http";
import { URL } from "url";
import { data } from "./data.js";

const PORT = process.env.PORT || 8000;
let users = data;

const server = http.createServer((req, res) => {
  const baseUrl = `http://${req.headers.host}`;
  const parsedUrl = new URL(req.url, baseUrl);

  // GET
  if (req.method === "GET" && parsedUrl.pathname === "/") {
    const id = parsedUrl.searchParams.get("id");
    if (id) {
      res.writeHead(200, { "Content-Type": "application/json" });
      let user = users.filter((u) => {
        if (u.id === parseInt(id)) return u;
      });
      if (user.length === 0) {
        res.end(JSON.stringify({ error: "user not found!" }));
      } else {
        res.end(JSON.stringify(user));
      }
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
    }
  }

  // POST
  if (req.method === "POST" && parsedUrl.pathname === "/") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
    });
    req.on("end", () => {
      if (data) {
        let newUser = JSON.parse(data);
        newUser.id = new Date().getTime();
        users.push(newUser);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", user: newUser }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "response body is empty" }));
      }
    });
  }

  // PUT
  if (req.method === "PUT" && parsedUrl.pathname === "/") {
    const id = parsedUrl.searchParams.get("id");
    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
    });
    req.on("end", () => {
      if (id) {
        let user = users.filter((u) => {
          if (u.id === parseInt(id)) return u;
        });
        if (user.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "user not found!" }));
        } else {
          if (data) {
            let newData = JSON.parse(data);
            const updatedUser = { ...user[0], ...newData };
            users = users.map((el) => (el.id == id ? updatedUser : el));
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "OK", user: updatedUser }));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "response body is empty" }));
          }
        }
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "user not found" }));
      }
    });
  }

  // DELETE
  if (req.method === "DELETE" && parsedUrl.pathname === "/") {
    const id = parsedUrl.searchParams.get("id");

    if (id) {
      let userExist = users.some((u) => u.id == id);
      if (userExist) {
        users = users.filter((u) => u.id != id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ status: "OK", message: "user deleted successfully" })
        );
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "user not found" }));
      }
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "user not found" }));
    }
  }
  if (parsedUrl.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  }
});

server.listen(PORT, () => {
  console.log(`server running at port: ${PORT}`);
});
