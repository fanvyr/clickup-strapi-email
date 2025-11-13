/**
 * email service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::email.email', ({ strapi }) => ({


  async postToClickUp(id) {
    console.log('inside postToClickUp', id);

  },

  transformPayload(body, globalConfig) {
    console.log('inside transformPayload', body);
    console.log('inside transformPayload', body.payload.custom_fields);

    let customFields = {} as any;




    body.payload.custom_fields.forEach((cfield: any) => {

      // if value is empty, return
      if (cfield.value === undefined || cfield.value === null || cfield.value.length === 0 || cfield.value === '') return

      // if date, convert to locale date string
      if (cfield.type === 'date') {

        customFields[cfield.name] = {
          datetime: '',
          date: ''
        };

        // set datetime to the date string
        let datetime = new Date(parseInt(cfield.value))
          .toLocaleDateString(globalConfig?.localization || 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })
          .replace('.', '');

        // set only date
        let date = new Date(parseInt(cfield.value))
          .toLocaleDateString(globalConfig?.localization || 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })
          .replace('.', '');

        customFields[cfield.name].datetime = datetime;
        customFields[cfield.name].date = date;

        return

      }

      // if value is array, extract the select values 
      if (cfield.type === 'labels') {
        // extract the options, query matching ones, build string out of it
        cfield.value = cfield.type_config.options.filter(el => cfield.value.includes(el.id)).map(el => el.label).join(', ')
      }

      // if value is an address
      if (cfield.type === 'location') {
        cfield.value = cfield.value.formatted_address
      }

      // if value is a dropdown, extract the label
      if (cfield.type === 'drop_down') {
        console.log('dropdown.options: ', cfield.type_config.options);

        cfield.value = cfield.type_config.options[cfield.value].name
      }

      // if value is a longtext, replace \n with new line
      if (cfield.type === 'longtext') {
        cfield.value = cfield.value.replace(/\\n/g, '\n');
      }

      // if boolean, convert to true/false
      if (cfield.type === 'boolean') {
        cfield.value = cfield.value ? globalConfig?.true_word || 'Yes' : globalConfig?.false_word || 'No';
      }


      customFields[cfield.name] = cfield.value;
    });

    customFields['TaskName'] = body.payload.name;

    return customFields;
  },



}));
