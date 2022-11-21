### removed old react-app README

#### chapter docker-kubernetes action workflow

* runs `npx create-react-app my-app` to gain an example project
* `cd my-app` go into root of frontend proj

##### creating the developer dockerfile
* `touch Dockerfile` -> production docker
* `touch Dockerfile.dev` -> development docker
* `docker build -f Dockerfile.dev .` /-f = file

##### Docker Volumes: how to gain hot reload for containers?
* consider we want to make changes on the `index.js` but want it to be reflected on our `docker run -p 3000:3000 <ebee06b498a6_anyId>`
* docker volumes map a folder from the local machine to the inner folder of the container
* empty expression example `docker run -p 3000:3000 -v /app/node_modules -v$(pwd):/app ebee06b498a6` // -> *(pwd)* is short for *present working directory*

> nasty error on linux
```bash
Failed to compile.

[eslint] EACCES: permission denied, mkdir '/app/node_modules/.cache'
ERROR in [eslint] EACCES: permission denied, mkdir '/app/node_modules/.cache'
```
solution is to alter Dockerfile with `USER` and `chown` possibly:
```bash
FROM node:alpine
 
USER node
 
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
 
COPY --chown=node:node ./package.json ./
RUN npm install
COPY --chown=node:node ./ ./
 
CMD ["npm", "start"]
```
```

Explanation of changes:

We are specifying that the USER which will execute RUN, CMD, or ENTRYPOINT instructions will be the node user, as opposed to root (default).

https://docs.docker.com/engine/reference/builder/#user

We are then creating a directory of /home/node/app prior to the WORKDIR instruction. This will prevent a permissions issue since WORKDIR by default will create a directory if it does not exist and set ownership to root.

The inline chown commands will set ownership of the files you are copying from your local environment to the node user in the container.

The end result is that some files and directories will no longer be owned by root, and no npm processes will be run by the root user. Instead, they will all be owned and run by the node user.
```



