export const evaluationSchema: any = {
  type: 'object',
  properties: {
    ratings: {
      type: 'object',
      title: '教学评分',
      description: '请根据实际情况对以下维度进行评分（1-5星，5星为最高分）',
      'ui:widget': 'card',
      properties: {
        teachingAttitude: {
          title: '教学态度',
          description: '评价教师的教学态度是否认真负责、耐心细致',
          type: 'number',
          widget: 'rate',
          required: true,
          props: {
            id: 'teachingAttitude',
            allowClear: false,
            tooltips: ['很差', '较差', '一般', '较好', '很好'],
          },
          rules: [
            {
              required: true,
              message: '请为"教学态度"进行评分',
            },
            {
              type: 'number' as const,
              min: 1,
              message: '请至少选择1星',
            },
          ] as any,
        },
        teachingContent: {
          title: '教学内容',
          description: '评价课程内容的丰富性、前沿性和实用性',
          type: 'number',
          widget: 'rate',
          required: true,
          props: {
            id: 'teachingContent',
            allowClear: false,
            tooltips: ['很差', '较差', '一般', '较好', '很好'],
          },
          rules: [
            {
              required: true,
              message: '请为"教学内容"进行评分',
            },
            {
              type: 'number' as const,
              min: 1,
              message: '请至少选择1星',
            },
          ] as any,
        },
        teachingMethod: {
          title: '教学方法',
          description: '评价教师的教学方法是否灵活多样、易于理解',
          type: 'number',
          widget: 'rate',
          required: true,
          props: {
            id: 'teachingMethod',
            allowClear: false,
            tooltips: ['很差', '较差', '一般', '较好', '很好'],
          },
          rules: [
            {
              required: true,
              message: '请为"教学方法"进行评分',
            },
            {
              type: 'number' as const,
              min: 1,
              message: '请至少选择1星',
            },
          ] as any,
        },
        interaction: {
          title: '课堂互动',
          description: '评价课堂互动氛围是否活跃、师生交流是否充分',
          type: 'number',
          widget: 'rate',
          required: true,
          props: {
            id: 'interaction',
            allowClear: false,
            tooltips: ['很差', '较差', '一般', '较好', '很好'],
          },
          rules: [
            {
              required: true,
              message: '请为"课堂互动"进行评分',
            },
            {
              type: 'number' as const,
              min: 1,
              message: '请至少选择1星',
            },
          ] as any,
        },
      },
    },
    feedback: {
      type: 'object',
      title: '主观评价',
      'ui:widget': 'card',
      properties: {
        comments: {
          title: '意见与建议',
          description: '请详细描述您对本课程的看法、建议或意见，这将帮助我们改进教学质量',
          type: 'string',
          widget: 'textArea',
          required: true,
          props: {
            id: 'comments',
            placeholder: '请输入您对本课程的建议或意见（不少于10字，最多500字）',
            autoSize: { minRows: 4, maxRows: 6 },
            showCount: true,
            maxLength: 500,
          },
          rules: [
            {
              required: true,
              message: '请输入您的意见与建议',
            },
            {
              min: 10,
              message: '评价内容不能少于10个字，请详细描述您的看法',
            },
          ] as any,
        },
      },
    },
  },
};
