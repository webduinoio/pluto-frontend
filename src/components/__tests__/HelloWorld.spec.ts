import { describe, expect, it } from 'vitest';

import vuetify from '@/plugins/vuetify';
import { mount } from '@vue/test-utils';
import HelloWorld from '../HelloWorld.vue';

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hello Vitest' },
      global: {
        plugins: [vuetify],
      },
    });
    expect(wrapper.text()).toContain('Hello Vitest');
  });
});
