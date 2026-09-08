export const deconstructionSchema = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          estimatedSeconds: {
            type: 'integer',
          },
        },
        required: ['title', 'estimatedSeconds'],
      },
    },
  },
  required: ['steps'],
};