const { User, Team, Project, Task } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    users: async () => {
      return await User.find({})
        .populate("projects")
        .populate("tasks")
        .populate("team");
    },
    user: async (parent, args) => {
      return await User.findById(args.id)
        .populate("projects")
        .populate("tasks");
    },
    teams: async () => {
      return await Team.find({}).populate("projects").populate("members");
    },
    team: async (parent, args) => {
      return await Team.findById(args.id).populate("members");
    },
    projects: async () => {
      return await Project.find({})
        .populate({
          path: "teams",
          populate: {
            path: "members",
            model: "User",
          },
        })
        .populate("tasks");
    },
    project: async (parent, args) => {
      return await Project.findById(args.id);
    },
    tasks: async () => {
      return await Task.find({}).populate("assignedUser").exec();
    },
    task: async (parent, args) => {
      return await Task.findById(args.id).populate("assignedUser");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email })
        .populate("projects")
        .populate("tasks")
        .populate("team");
      if (!user) {
        throw AuthenticationError;
      }

      const corrPassword = await user.isCorrectPassword(password);
      if (!corrPassword) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { user, token };
    },
    addUser: (parent, { input }) => {
      // Destructure input to extract teamId
      const { teamId, ...userData } = input;

      try {
        // Create the user with the provided data
        return User.create(userData).then((user) => {
          // If teamId is provided and not null or undefined, associate the user with the team
          if (teamId !== null && teamId !== undefined) {
            // Fetch the team based on the provided teamId
            return Team.findById(teamId)
              .then((team) => {
                if (!team) {
                  throw new Error("Team not found");
                }

                // Associate the user with the team
                user.team = team._id;
                return user.save();
              })
              .then(() => {
                // Return the created user
                return { user };
              });
          }

          // Return the created user
          return { user };
        });
      } catch (error) {
        // Handle any errors
        throw new Error("Failed to add user");
      }
    },

    updateUser: async (parent, { userId, input }) => {
      return await User.findOneAndUpdate(
        { _id: userId },
        { $set: input },
        { new: true }
      );
    },
    removeUser: async (parent, { userId }) => {
      return User.findOneAndDelete({ _id: userId });
    },
    addProject: async (parent, { input }) => {
      // Create the project
      const project = await Project.create(input);

      // Fetch the associated team using teamIds
      const teams = await Team.find({ _id: { $in: input.teamIds } });

      // Fetch the associated tasks using taskIds
      const tasks = await Task.find({ _id: { $in: input.taskIds } });

      // Populate the teams and tasks fields of the project
      project.teams = teams;
      project.tasks = tasks;

      // Save the project with populated fields
      await project.save();

      // Return the project object
      return project;
    },
    updateProject: async (parent, { projectId, input }) => {
      try {
        const project = await Project.findById(projectId);

        if (!project) {
          throw new Error("Project not found");
        }

        project.set(input);

        if (input.teamIds && input.teamIds.length > 0) {
          const teams = await Team.find({ _id: { $in: input.teamIds } });
          const tasks = await Task.find({ _id: { $in: input.taskIds } });
          project.teams = teams;
          project.tasks = tasks;
        }

        const updatedProject = await project.save();

        return updatedProject;
      } catch (error) {
        console.error("Failed to update project:", error);
        throw new Error("Failed to update project");
      }
    },
    removeProject: async (parent, { projectId }) => {
      return Project.findOneAndDelete({ _id: projectId });
    },
    // addTask: async (parent, { input }) => {
    //     return Task.create(input);
    // },
    addTask: async (parent, { projectId, input }) => {
      // Your logic to create the task and associate it with the project
      const task = await Task.create(input);

      // Fetch the project based on the provided projectId
      const project = await Project.findById(projectId);

      // Associate the task with the project
      project.tasks.push(task);
      await project.save();

      // Fetch the assigned user based on the input
      const user = await User.findById(input.assignedUserId).populate({
        path: "projects",
        populate: {
          path: "tasks",
          model: "Task",
        },
      });

      // Return the task with the assigned user
      return {
        ...task.toObject(),
        assignedUser: user,
      };
    },
    updateTask: async (parent, { taskId, input }) => {
      return await Task.findOneAndUpdate(
        { _id: taskId },
        { $set: input },
        { new: true }
      );
    },
    removeTask: async (parent, { taskId }) => {
      return Task.findOneAndDelete({ _id: taskId });
    },
  },
};

module.exports = resolvers;
