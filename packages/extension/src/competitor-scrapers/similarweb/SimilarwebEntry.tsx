import { render } from 'solid-js/web';
import axios from 'axios';
import Similarweb from './Similarweb';

axios.defaults.withCredentials = true;

render(() => <Similarweb />, document.body);
