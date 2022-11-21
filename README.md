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

* the final `docker run` with docker volumes
`docker run -p 3000:3000 -v /home/node/app/node_modules -v $(pwd):/home/node/app 47f680845db3`
* please take a note, create-react-app is still the one hotreloading, but with docker volumes we can get the update reflected

* we could still improve further on, for this we use docker-compose
* consider this `docker-compose.yaml`
```bash
version: '3'
services:
  react-app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes: 
      - /home/node/app/node_modules   #bookmarking node_modules
      - .:/home/node/app              #mount localfilesystem
    restart: unless-stopped
```
* run it with
`docker-compose up --build`


#### running tests the pros and the cons, 
> tl:dr there is no ideal solution :-P
* assumes you have the container id in hand
* the CLI way is `docker run <ContainerId> npm run test -it` to also connect our machine to STDIN
* while developing also `docker exec -it <containerID> npm run test` could be of use, by doint so, we attach our self to the already running docker and gain hotlreload on changes // *not a perfect solution*
* we refactored `docker-compose.yaml` to run tests on a second `services`
* commands are provide to `docker-compose.yaml` like this ` command: ["npm", "run", "test"]`
* **pro** of this, it is encapsulated, BUT **con** is that all tests are rereun on changes all the time, and we dont have STDIN from `docker exec`, which allowed us top trigger tests manually
* we tried `docker ps` && `docker attach <containerId>` but we are not able to send to STDIN here
* another way is `docker exec -it <containerId> sh` which let's us slip directly into the running container and would allow us in another terminal window to `npm run test` and gain the runner options with STDIN

#### running the production version
* since we don't have a dev web server here, we go with nginx
* flow is
  1. use node:alpine
  2. copy package.josn
  3. install all depts // Deps ony need to execute build, we would need it, to save 150mb of depts
  4. `npm run build`
  5. copy stuff around || serve build directory
  6. start nginx











