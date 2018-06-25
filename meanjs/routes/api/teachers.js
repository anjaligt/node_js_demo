'use strict';

var teacherslib     = require('../../lib/db/teachers');
var schoolslib      = require('../../lib/db/schools');
var districtslib    = require('../../lib/db/districts');
var studentslib     = require('../../lib/db/students');
var literacylib     = require('../../lib/db/literacy');
var numeracylib     = require('../../lib/db/numeracy');
var sociallib       = require('../../lib/db/social');
var teachersSchema  = require('../../lib/db/schema/teachers');
var utils           = require('../../lib/utils');
var _               = require('underscore');
var Unauthorized    = require('../../errors/errors').Unauthorized;
var BadRequest      = require('../../errors/errors').BadRequest;
var debug           = require('debug')('ff:teachers');
var errMsg          = require('../../errors/errorCodes');
var common          = require('../../lib/common');
var formidable      = require('formidable');
var async           = require('async');
var json2csv = require('json2csv');
var path = require('path');
var fs = require('fs');
var pdf = require('html-pdf');
//var passwordOption = ['1234567','2345678','abcdefgh','xyzabcd'];
var passwordOption = ['ability', 'able', 'aboard', 'about', 'above', 'accept', 'accident', 'according',
  'account', 'accurate', 'acres', 'across', 'act', 'action', 'active', 'activity',
  'actual', 'actually', 'add', 'addition', 'additional', 'adjective', 'adult', 'adventure',
  'advice', 'affect', 'afraid', 'after', 'afternoon', 'again', 'against', 'age',
  'ago', 'agree', 'ahead', 'aid', 'air', 'airplane', 'alike', 'alive',
  'all', 'allow', 'almost', 'alone', 'along', 'aloud', 'alphabet', 'already',
  'also', 'although', 'am', 'among', 'amount', 'ancient', 'angle', 'angry',
  'animal', 'announced', 'another', 'answer', 'ants', 'any', 'anybody', 'anyone',
  'anything', 'anyway', 'anywhere', 'apart', 'apartment', 'appearance', 'apple', 'applied',
  'appropriate', 'are', 'area', 'arm', 'army', 'around', 'arrange', 'arrangement',
  'arrive', 'arrow', 'art', 'article', 'as', 'aside', 'ask', 'asleep',
  'at', 'ate', 'atmosphere', 'atom', 'atomic', 'attached', 'attack', 'attempt',
  'attention', 'audience', 'author', 'automobile', 'available', 'average', 'avoid', 'aware',
  'away', 'baby', 'back', 'bad', 'badly', 'bag', 'balance', 'ball',
  'balloon', 'band', 'bank', 'bar', 'bare', 'bark', 'barn', 'base',
  'baseball', 'basic', 'basis', 'basket', 'bat', 'battle', 'be', 'bean',
  'bear', 'beat', 'beautiful', 'beauty', 'became', 'because', 'become', 'becoming',
  'bee', 'been', 'before', 'began', 'beginning', 'begun', 'behavior', 'behind',
  'being', 'believed', 'bell', 'belong', 'below', 'belt', 'bend', 'beneath',
  'bent', 'beside', 'best', 'bet', 'better', 'between', 'beyond', 'bicycle',
  'bigger', 'biggest', 'bill', 'birds', 'birth', 'birthday', 'bit', 'bite',
  'black', 'blank', 'blanket', 'blew', 'blind', 'block', 'blood', 'blow',
  'blue', 'board', 'boat', 'body', 'bone', 'book', 'border', 'born',
  'both', 'bottle', 'bottom', 'bound', 'bow', 'bowl', 'box', 'boy',
  'brain', 'branch', 'brass', 'brave', 'bread', 'break', 'breakfast', 'breath',
  'breathe', 'breathing', 'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring',
  'broad', 'broke', 'broken', 'brother', 'brought', 'brown', 'brush', 'buffalo',
  'build', 'building', 'built', 'buried', 'burn', 'burst', 'bus', 'bush',
  'business', 'busy', 'but', 'butter', 'buy', 'by', 'cabin', 'cage',
  'cake', 'call', 'calm', 'came', 'camera', 'camp', 'can', 'canal',
  'cannot', 'cap', 'capital', 'captain', 'captured', 'car', 'carbon', 'card',
  'care', 'careful', 'carefully', 'carried', 'carry', 'case', 'cast', 'castle',
  'cat', 'catch', 'cattle', 'caught', 'cause', 'cave', 'cell', 'cent',
  'center', 'central', 'century', 'certain', 'certainly', 'chain', 'chair', 'chamber',
  'chance', 'change', 'changing', 'chapter', 'character', 'characteristic', 'charge', 'chart',
  'check', 'cheese', 'chemical', 'chest', 'chicken', 'chief', 'child', 'children',
  'choice', 'choose', 'chose', 'chosen', 'church', 'circle', 'circus', 'citizen',
  'city', 'class', 'classroom', 'claws', 'clay', 'clean', 'clear', 'clearly',
  'climate', 'climb', 'clock', 'close', 'closely', 'closer', 'cloth', 'clothes',
  'clothing', 'cloud', 'club', 'coach', 'coal', 'coast', 'coat', 'coffee',
  'cold', 'collect', 'college', 'colony', 'color', 'column', 'combination', 'combine',
  'come', 'comfortable', 'coming', 'command', 'common', 'community', 'company', 'compare',
  'compass', 'complete', 'completely', 'complex', 'composed', 'composition', 'compound', 'concerned',
  'condition', 'congress', 'connected', 'consider', 'consist', 'consonant', 'constantly', 'construction',
  'contain', 'continent', 'continued', 'contrast', 'control', 'conversation', 'cook', 'cookies',
  'cool', 'copper', 'copy', 'corn', 'corner', 'correct', 'correctly', 'cost',
  'cotton', 'could', 'count', 'country', 'couple', 'courage', 'course', 'court',
  'cover', 'cow', 'cowboy', 'crack', 'cream', 'create', 'creature', 'crew',
  'crop', 'cross', 'crowd', 'cry', 'cup', 'curious', 'current', 'curve',
  'customs', 'cut', 'cutting', 'daily', 'damage', 'dance', 'danger', 'dangerous',
  'dark', 'darkness', 'date', 'daughter', 'dawn', 'day', 'dead', 'deal',
  'dear', 'death', 'decide', 'declared', 'deep', 'deeply', 'deer', 'definition',
  'degree', 'depend', 'depth', 'describe', 'desert', 'design', 'desk', 'detail',
  'determine', 'develop', 'development', 'diagram', 'diameter', 'did', 'die', 'differ',
  'difference', 'different', 'difficult', 'difficulty', 'dig', 'dinner', 'direct', 'direction',
  'directly', 'dirt', 'dirty', 'disappear', 'discover', 'discovery', 'discuss', 'discussion',
  'disease', 'dish', 'distance', 'distant', 'divide', 'division', 'do', 'doctor',
  'does', 'dog', 'doing', 'doll', 'dollar', 'done', 'donkey', 'door',
  'dot', 'double', 'doubt', 'down', 'dozen', 'draw', 'drawn', 'dream',
  'dress', 'drew', 'dried', 'drink', 'drive', 'driven', 'driver', 'driving',
  'drop', 'dropped', 'drove', 'dry', 'duck', 'due', 'dug', 'dull',
  'during', 'dust', 'duty', 'each', 'eager', 'ear', 'earlier', 'early',
  'earn', 'earth', 'easier', 'easily', 'east', 'easy', 'eat', 'eaten',
  'edge', 'education', 'effect', 'effort', 'egg', 'eight', 'either', 'electric',
  'electricity', 'element', 'elephant', 'eleven', 'else', 'empty', 'end', 'enemy',
  'energy', 'engine', 'engineer', 'enjoy', 'enough', 'enter', 'entire', 'entirely',
  'environment', 'equal', 'equally', 'equator', 'equipment', 'escape', 'especially', 'essential',
  'establish', 'even', 'evening', 'event', 'eventually', 'ever', 'every', 'everybody',
  'everyone', 'everything', 'everywhere', 'evidence', 'exact', 'exactly', 'examine', 'example',
  'excellent', 'except', 'exchange', 'excited', 'excitement', 'exciting', 'exclaimed', 'exercise',
  'exist', 'expect', 'experience', 'experiment', 'explain', 'explanation', 'explore', 'express',
  'expression', 'extra', 'eye', 'face', 'facing', 'fact', 'factor', 'factory',
  'failed', 'fair', 'fairly', 'fall', 'fallen', 'familiar', 'family', 'famous',
  'far', 'farm', 'farmer', 'farther', 'fast', 'fastened', 'faster', 'fat',
  'father', 'favorite', 'fear', 'feathers', 'feature', 'fed', 'feed', 'feel',
  'feet', 'fell', 'fellow', 'felt', 'fence', 'few', 'fewer', 'field',
  'fierce', 'fifteen', 'fifth', 'fifty', 'fight', 'fighting', 'figure', 'fill',
  'film', 'final', 'finally', 'find', 'fine', 'finest', 'finger', 'finish',
  'fire', 'fireplace', 'firm', 'first', 'fish', 'five', 'fix', 'flag',
  'flame', 'flat', 'flew', 'flies', 'flight', 'floating', 'floor', 'flow',
  'flower', 'fly', 'fog', 'folks', 'follow', 'food', 'foot', 'football',
  'for', 'force', 'foreign', 'forest', 'forget', 'forgot', 'forgotten', 'form',
  'former', 'fort', 'forth', 'forty', 'forward', 'fought', 'found', 'four',
  'fourth', 'fox', 'frame', 'free', 'freedom', 'frequently', 'fresh', 'friend',
  'friendly', 'frighten', 'frog', 'from', 'front', 'frozen', 'fruit', 'fuel',
  'full', 'fully', 'fun', 'function', 'funny', 'fur', 'furniture', 'further',
  'future', 'gain', 'game', 'garage', 'garden', 'gas', 'gasoline', 'gate',
  'gather', 'gave', 'general', 'generally', 'gentle', 'gently', 'get', 'getting',
  'giant', 'gift', 'girl', 'give', 'given', 'giving', 'glad', 'glass',
  'globe', 'go', 'goes', 'gold', 'golden', 'gone', 'good', 'goose',
  'got', 'government', 'grabbed', 'grade', 'gradually', 'grain', 'grandfather', 'grandmother',
  'graph', 'grass', 'gravity', 'gray', 'great', 'greater', 'greatest', 'greatly',
  'green', 'grew', 'ground', 'group', 'grow', 'grown', 'growth', 'guard',
  'guess', 'guide', 'gulf', 'gun', 'habit', 'had', 'hair', 'half',
  'halfway', 'hall', 'hand', 'handle', 'handsome', 'hang', 'happen', 'happened',
  'happily', 'happy', 'harbor', 'hard', 'harder', 'hardly', 'has', 'hat',
  'have', 'having', 'hay', 'he', 'headed', 'heading', 'health', 'heard',
  'hearing', 'heart', 'heat', 'heavy', 'height', 'held', 'hello', 'help',
  'helpful', 'her', 'herd', 'here', 'herself', 'hidden', 'hide', 'high',
  'higher', 'highest', 'highway', 'hill', 'him', 'himself', 'his', 'history',
  'hit', 'hold', 'hole', 'hollow', 'home', 'honor', 'hope', 'horn',
  'horse', 'hospital', 'hot', 'hour', 'house', 'how', 'however', 'huge',
  'human', 'hundred', 'hung', 'hungry', 'hunt', 'hunter', 'hurried', 'hurry',
  'hurt', 'husband', 'ice', 'idea', 'identity', 'if', 'ill', 'image',
  'imagine', 'immediately', 'importance', 'important', 'impossible', 'improve', 'in', 'inch',
  'include', 'including', 'income', 'increase', 'indeed', 'independent', 'indicate', 'individual',
  'industrial', 'industry', 'influence', 'information', 'inside', 'instance', 'instant', 'instead',
  'instrument', 'interest', 'interior', 'into', 'introduced', 'invented', 'involved', 'iron',
  'is', 'island', 'it', 'its', 'itself', 'jack', 'jar', 'jet',
  'job', 'join', 'joined', 'journey', 'joy', 'judge', 'jump', 'jungle',
  'just', 'keep', 'kept', 'key', 'kids', 'kill', 'kind', 'kitchen',
  'knew', 'knife', 'know', 'knowledge', 'known', 'label', 'labor', 'lack',
  'lady', 'laid', 'lake', 'lamp', 'land', 'language', 'large', 'larger',
  'largest', 'last', 'late', 'later', 'laugh', 'law', 'lay', 'layers',
  'lead', 'leader', 'leaf', 'learn', 'least', 'leather', 'leave', 'leaving',
  'led', 'left', 'leg', 'length', 'lesson', 'let', 'letter', 'level',
  'library', 'lie', 'life', 'lift', 'light', 'like', 'likely', 'limited',
  'line', 'lion', 'lips', 'liquid', 'list', 'listen', 'little', 'live',
  'living', 'load', 'local', 'locate', 'location', 'log', 'lonely', 'long',
  'longer', 'look', 'loose', 'lose', 'loss', 'lost', 'lot', 'loud',
  'love', 'lovely', 'low', 'lower', 'luck', 'lucky', 'lunch', 'lungs',
  'lying', 'machine', 'machinery', 'mad', 'made', 'magic', 'magnet', 'mail',
  'main', 'mainly', 'major', 'make', 'making', 'man', 'managed', 'manner',
  'manufacturing', 'many', 'map', 'mark', 'market', 'married', 'mass', 'massage',
  'master', 'material', 'mathematics', 'matter', 'may', 'maybe', 'me', 'meal',
  'mean', 'means', 'meant', 'measure', 'meat', 'medicine', 'meet', 'melted',
  'member', 'memory', 'men', 'mental', 'merely', 'met', 'metal', 'method',
  'mice', 'middle', 'might', 'mighty', 'mile', 'military', 'milk', 'mill',
  'mind', 'mine', 'minerals', 'minute', 'mirror', 'missing', 'mission', 'mistake',
  'mix', 'mixture', 'model', 'modern', 'molecular', 'moment', 'money', 'monkey',
  'month', 'mood', 'moon', 'more', 'morning', 'most', 'mostly', 'mother',
  'motion', 'motor', 'mountain', 'mouse', 'mouth', 'move', 'movement', 'movie',
  'moving', 'mud', 'muscle', 'music', 'musical', 'must', 'my', 'myself',
  'mysterious', 'nails', 'name', 'nation', 'national', 'native', 'natural', 'naturally',
  'nature', 'near', 'nearby', 'nearer', 'nearest', 'nearly', 'necessary', 'neck',
  'needed', 'needle', 'needs', 'negative', 'neighbor', 'neighborhood', 'nervous', 'nest',
  'never', 'new', 'news', 'newspaper', 'next', 'nice', 'night', 'nine',
  'no', 'nobody', 'nodded', 'noise', 'none', 'noon', 'nor', 'north',
  'nose', 'not', 'note', 'noted', 'nothing', 'notice', 'noun', 'now',
  'number', 'numeral', 'nuts', 'object', 'observe', 'obtain', 'occasionally', 'occur',
  'ocean', 'of', 'off', 'offer', 'office', 'officer', 'official', 'oil',
  'old', 'older', 'oldest', 'on', 'once', 'one', 'only', 'onto',
  'open', 'operation', 'opinion', 'opportunity', 'opposite', 'or', 'orange', 'orbit',
  'order', 'ordinary', 'organization', 'organized', 'origin', 'original', 'other', 'ought',
  'our', 'ourselves', 'out', 'outer', 'outline', 'outside', 'over', 'own',
  'owner', 'oxygen', 'pack', 'package', 'page', 'paid', 'pain', 'paint',
  'pair', 'palace', 'pale', 'pan', 'paper', 'paragraph', 'parallel', 'parent',
  'park', 'part', 'particles', 'particular', 'particularly', 'partly', 'parts', 'party',
  'pass', 'passage', 'past', 'path', 'pattern', 'pay', 'peace', 'pen',
  'pencil', 'people', 'per', 'percent', 'perfect', 'perfectly', 'perhaps', 'period',
  'person', 'personal', 'pet', 'phrase', 'physical', 'piano', 'pick', 'picture',
  'pictured', 'pie', 'piece', 'pig', 'pile', 'pilot', 'pine', 'pink',
  'pipe', 'pitch', 'place', 'plain', 'plan', 'plane', 'planet', 'planned',
  'planning', 'plant', 'plastic', 'plate', 'plates', 'play', 'pleasant', 'please',
  'pleasure', 'plenty', 'plural', 'plus', 'pocket', 'poem', 'poet', 'poetry',
  'point', 'pole', 'police', 'policeman', 'political', 'pond', 'pony', 'pool',
  'poor', 'popular', 'population', 'porch', 'port', 'position', 'positive', 'possible',
  'possibly', 'post', 'pot', 'potatoes', 'pound', 'pour', 'powder', 'power',
  'powerful', 'practical', 'practice', 'prepare', 'present', 'president', 'press', 'pressure',
  'pretty', 'prevent', 'previous', 'price', 'pride', 'primitive', 'principal', 'principle',
  'printed', 'private', 'prize', 'probably', 'problem', 'process', 'produce', 'product',
  'production', 'program', 'progress', 'promised', 'proper', 'properly', 'property', 'protection',
  'proud', 'prove', 'provide', 'public', 'pull', 'pupil', 'pure', 'purple',
  'purpose', 'push', 'put', 'putting', 'quarter', 'queen', 'question', 'quick',
  'quickly', 'quiet', 'quietly', 'quite', 'rabbit', 'race', 'radio', 'railroad',
  'rain', 'raise', 'ran', 'ranch', 'range', 'rapidly', 'rate', 'rather',
  'raw', 'rays', 'reach', 'read', 'reader', 'ready', 'real', 'realize',
  'rear', 'reason', 'recall', 'receive', 'recent', 'recently', 'recognize', 'record',
  'red', 'refer', 'refused', 'region', 'regular', 'related', 'relationship', 'religious',
  'remain', 'remarkable', 'remember', 'remove', 'repeat', 'replace', 'replied', 'report',
  'represent', 'require', 'research', 'respect', 'rest', 'result', 'return', 'review',
  'rhyme', 'rhythm', 'rice', 'rich', 'ride', 'riding', 'right', 'ring',
  'rise', 'rising', 'river', 'road', 'roar', 'rock', 'rocket', 'rocky',
  'rod', 'roll', 'roof', 'room', 'root', 'rope', 'rose', 'rough',
  'round', 'route', 'row', 'rubbed', 'rubber', 'rule', 'ruler', 'run',
  'running', 'rush', 'sad', 'saddle', 'safe', 'safety', 'said', 'sail',
  'sale', 'salmon', 'salt', 'same', 'sand', 'sang', 'sat', 'satellites',
  'satisfied', 'save', 'saved', 'saw', 'say', 'scale', 'scared', 'scene',
  'school', 'science', 'scientific', 'scientist', 'score', 'screen', 'sea', 'search',
  'season', 'seat', 'second', 'secret', 'section', 'see', 'seed', 'seeing',
  'seems', 'seen', 'seldom', 'select', 'selection', 'sell', 'send', 'sense',
  'sent', 'sentence', 'separate', 'series', 'serious', 'serve', 'service', 'sets',
  'setting', 'settle', 'settlers', 'seven', 'several', 'shade', 'shadow', 'shake',
  'shaking', 'shall', 'shallow', 'shape', 'share', 'sharp', 'she', 'sheep',
  'sheet', 'shelf', 'shells', 'shelter', 'shine', 'shinning', 'ship', 'shirt',
  'shoe', 'shoot', 'shop', 'shore', 'short', 'shorter', 'shot', 'should',
  'shoulder', 'shout', 'show', 'shown', 'shut', 'sick', 'sides', 'sight',
  'sign', 'signal', 'silence', 'silent', 'silk', 'silly', 'silver', 'similar',
  'simple', 'simplest', 'simply', 'since', 'sing', 'single', 'sink', 'sister',
  'sit', 'sitting', 'situation', 'six', 'size', 'skill', 'skin', 'sky',
  'slabs', 'slave', 'sleep', 'slept', 'slide', 'slight', 'slightly', 'slip',
  'slipped', 'slope', 'slow', 'slowly', 'small', 'smaller', 'smallest', 'smell',
  'smile', 'smoke', 'smooth', 'snake', 'snow', 'so', 'soap', 'social',
  'society', 'soft', 'softly', 'soil', 'solar', 'sold', 'soldier', 'solid',
  'solution', 'solve', 'some', 'somebody', 'somehow', 'someone', 'something', 'sometime',
  'somewhere', 'son', 'song', 'soon', 'sort', 'sound', 'source', 'south',
  'southern', 'space', 'speak', 'special', 'species', 'specific', 'speech', 'speed',
  'spell', 'spend', 'spent', 'spider', 'spin', 'spirit', 'spite', 'split',
  'spoken', 'sport', 'spread', 'spring', 'square', 'stage', 'stairs', 'stand',
  'standard', 'star', 'stared', 'start', 'state', 'statement', 'station', 'stay',
  'steady', 'steam', 'steel', 'steep', 'stems', 'step', 'stepped', 'stick',
  'stiff', 'still', 'stock', 'stomach', 'stone', 'stood', 'stop', 'stopped',
  'store', 'storm', 'story', 'stove', 'straight', 'strange', 'stranger', 'straw',
  'stream', 'street', 'strength', 'stretch', 'strike', 'string', 'strip', 'strong',
  'stronger', 'struck', 'structure', 'struggle', 'stuck', 'student', 'studied', 'studying',
  'subject', 'substance', 'success', 'successful', 'such', 'sudden', 'suddenly', 'sugar',
  'suggest', 'suit', 'sum', 'summer', 'sun', 'sunlight', 'supper', 'supply',
  'support', 'suppose', 'sure', 'surface', 'surprise', 'surrounded', 'swam', 'sweet',
  'swept', 'swim', 'swimming', 'swing', 'swung', 'syllable', 'symbol', 'system',
  'table', 'tail', 'take', 'taken', 'tales', 'talk', 'tall', 'tank',
  'tape', 'task', 'taste', 'taught', 'tax', 'tea', 'teach', 'teacher',
  'team', 'tears', 'teeth', 'telephone', 'television', 'tell', 'temperature', 'ten',
  'tent', 'term', 'terrible', 'test', 'than', 'thank', 'that', 'thee',
  'them', 'themselves', 'then', 'theory', 'there', 'therefore', 'these', 'they',
  'thick', 'thin', 'thing', 'think', 'third', 'thirty', 'this', 'those',
  'thou', 'though', 'thought', 'thousand', 'thread', 'three', 'threw', 'throat',
  'through', 'throughout', 'throw', 'thrown', 'thumb', 'thus', 'thy', 'tide',
  'tie', 'tight', 'till', 'time', 'tin', 'tiny', 'tip',
  'tired', 'title', 'to', 'tobacco', 'today', 'together', 'told', 'tomorrow',
  'tone', 'tongue', 'tonight', 'too', 'took', 'tool', 'top', 'topic',
  'torn', 'total', 'touch', 'toward', 'tower', 'town', 'toy', 'trace',
  'track', 'trade', 'traffic', 'trail', 'train', 'transportation', 'trap', 'travel',
  'treated', 'tree', 'triangle', 'tribe', 'trick', 'tried', 'trip', 'troops',
  'tropical', 'trouble', 'truck', 'trunk', 'truth', 'try', 'tube', 'tune',
  'turn', 'twelve', 'twenty', 'twice', 'two', 'type', 'typical', 'uncle',
  'under', 'underline', 'understanding', 'unhappy', 'union', 'unit', 'universe', 'unknown',
  'unless', 'until', 'unusual', 'up', 'upon', 'upper', 'upward', 'us',
  'use', 'useful', 'using', 'usual', 'usually', 'valley', 'valuable', 'value',
  'vapor', 'variety', 'various', 'vast', 'vegetable', 'verb', 'vertical', 'very',
  'vessels', 'victory', 'view', 'village', 'visit', 'visitor', 'voice', 'volume',
  'vote', 'vowel', 'voyage', 'wagon', 'wait', 'walk', 'wall', 'want',
  'war', 'warm', 'warn', 'was', 'wash', 'waste', 'watch', 'water',
  'wave', 'way', 'we', 'weak', 'wealth', 'wear', 'weather', 'week',
  'weigh', 'weight', 'welcome', 'well', 'went', 'were', 'west', 'western',
  'wet', 'whale', 'what', 'whatever', 'wheat', 'wheel', 'when', 'whenever',
  'where', 'wherever', 'whether', 'which', 'while', 'whispered', 'whistle', 'white',
  'who', 'whole', 'whom', 'whose', 'why', 'wide', 'widely', 'wife',
  'wild', 'will', 'willing', 'win', 'wind', 'window', 'wing', 'winter',
  'wire', 'wise', 'wish', 'with', 'within', 'without', 'wolf', 'women',
  'won', 'wonder', 'wonderful', 'wood', 'wooden', 'wool', 'word', 'wore',
  'work', 'worker', 'world', 'worried', 'worry', 'worse', 'worth', 'would',
  'wrapped', 'write', 'writer', 'writing', 'written', 'wrong', 'wrote', 'yard',
  'year', 'yellow', 'yes', 'yesterday', 'yet', 'you', 'young', 'younger',
  'your', 'yourself', 'youth', 'zero', 'zoo', 'battery', 'staple'];

exports.extractParams = function(req, res, next) {
    var keys = ['firstName', 'lastName', 'email', 'pin'];
    var teachersSchema = {
        firstName: '',
        lastName: '',
        email: '',
        active: true,
        enabled: true,
        created: '',
        createdIso: '',
        updated: '',
        updatedIso: '',
        password: '',
        admin_teacher: '',
    };
    //var teachersSchema = new TeachersSchema();
    _.extend(teachersSchema, _.pick(req.body, keys));
    utils.trim(teachersSchema);
    var actualPassword = passwordOption[Math.floor(Math.random() * passwordOption.length)] + Math.floor((Math.random() * 10) + 1);
    var bcrypt         = require('bcrypt');
    var salt           = bcrypt.genSaltSync(10);
    var hash           = bcrypt.hashSync(actualPassword, salt);
    teachersSchema.actualPassword = actualPassword;
    teachersSchema.password = hash;
    req.store.set('teachers', teachersSchema);
    next();
};


exports.extractLoginParams = function(req, res, next) {
    var keys = ['email', 'password'];
    var teachersSchema = {
        firstName: '',
        lastName: '',
        email: '',
        active: true,
        enabled: true,
        created: '',
        createdIso: '',
        updated: '',
        updatedIso: '',
        password: '',
        admin_teacher: '',
    };
    //new TeachersSchema();
    _.extend(teachersSchema, _.pick(req.body, keys));
    utils.trim(teachersSchema);
    req.store.set('teachers', teachersSchema);
    next();
};


exports.doLogin = function(req, res, next) {
    var districtarr = [];
    var countyarr = [];
    var teachers = req.store.get('teachers');
    var bcrypt = require('bcrypt');
    teacherslib.findTeacher({
        email: teachers.email,
        enabled: true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher) {
            var hasMatched = bcrypt.compareSync(teachers.password, teacher.password);
            if (hasMatched) {
                async.series({
                    district: function(callback) {
                        var query = {
                            _id: utils.toObjectId(teacher.schoolId),
                            active: true,
                            enabled: true
                        };
                        schoolslib.getSchoolsData(query, {}, function(err, district) {
                            if (err) {
                                return next(err);
                            }
                            //district = district;
                            districtarr.push(utils.toObjectId(district[0].distId));
                            callback(null, district);
                        });
                    },
                    county: function(callback) {
                        var query = {
                            _id: {
                                $in: districtarr
                            },
                            active: true,
                            enabled: true
                        };

                        

                        districtslib.getDistricts(query, function(err, county) {
                            if (err) {
                                return next(err);
                            }
                            countyarr.push(county[0].countyId);
                            callback(null, county)
                        });
                    },
                    county_record: function(cb) {
                        var query1 = {
                            _id: {
                                $in: countyarr
                            },
                            active: true,
                            enabled: true
                        };

                        districtslib.getCounties(query1, function(err, county_record) {
                            if (err) {
                                return next(err);
                            }
                            county_record = county_record;
                            cb(null, county_record);

                        });
                    },

                }, function(err, results) {
                    teacher.county_id = results.county_record[0]._id;
                    teacher.county_name = results.county_record[0].name;
                    teacher.school_name = results.district[0].name;
                    teacher.district_id = results.county[0]._id;

                    res.response = { code: '200', 'data': teacher };


                    var update_query = {isLoggedIn:1,updated: new Date().getTime(),updatedIso: new Date().toISOString()};

                    teacherslib.updateTeacher({ email: teacher.email}, update_query, function(err) {
                        debug(err);
                    });
                    res.status(200).json({
                        result: res.response
                    });
                });

            } else { //wrong password

                res.response = {
                    code: '502',
                    'heading': 'Wrong Password',
                    'message': 'You have entered a wrong password for this email. Please try again or reset you password.'
                };

                res.status(200).json({
                    result: res.response
                });
                //return next(new BadRequest('You have entered a wrong password for this email. Please try again or reset you password.',502));
            }
            //res.response = {teacher:teacher, query: {email: teachers.email, password: hash, enabled: true},hasMatched:hasMatched};
        } else { //no email exists
            res.response = {
                code: '501',
                'heading': 'No Account Exist',
                'message': 'No login exists for this email. Please check with app administrator to have account added.'
            };
            res.status(200).json({
                result: res.response
            });
            //return next(new BadRequest('No login exists for this email. Please check with app administrator to have account added.',501));
            //res.response = {query: {email: teachers.email, password: hash, enabled: true}};
        }
        //next();
    });
};


exports.extractResetPasswordParams = function(req, res, next) {
    var passwordData = {
        teacherId: req.body.teacherId,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword
    };
    req.store.set('passwordData', passwordData);
    next();
};


exports.resetPassword = function(req, res, next) {
    var passwordData = req.store.get('passwordData');
    teacherslib.findTeacher({
        _id: utils.toObjectId(passwordData.teacherId),
        enabled: true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher) {
            var bcrypt = require('bcrypt');
            var hasMatched = bcrypt.compareSync(passwordData.oldPassword, teacher.password);
            if (hasMatched) { //old password match, change password here
                res.response = {
                    code: '200',
                    'message': 'Password changed successfully'
                };
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(passwordData.newPassword, salt);
                teacherslib.updateTeacher({
                    _id: utils.toObjectId(passwordData.teacherId),
                    enabled: true
                }, {
                    password: hash
                }, function(err) {
                    debug(err);
                });
            } else { //wrong password
                res.response = {
                    code: '502',
                    'heading': 'Wrong Password',
                    'message': 'You have entered a wrong password. Please try again.'
                };
            }
        } else { //no email exists
            res.response = {
                code: '501',
                'heading': 'No Account Exist',
                'message': 'No login exists for this teacher. Please check with app administrator to have account added.'
            };
        }
        next();
    });
};


exports.extractForgotPasswordParams = function(req, res, next) {
    var passwordData = {
        email: req.body.email
    };
    req.store.set('passwordData', passwordData);
    next();
};

exports.processForgotPassword = function(req, res, next) {
    var passwordData = req.store.get('passwordData');
    teacherslib.findTeacher({
        email: passwordData.email,
        enabled: true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher) {
            //send new password here
            var bcrypt = require('bcrypt');
            res.response = {
                code: '200',
                'heading': 'Thank You',
                'message': 'A reset password email has been sent to ' + passwordData.email
            };
            var salt = bcrypt.genSaltSync(10);
            var actualPassword = passwordOption[Math.floor(Math.random() * passwordOption.length)] + Math.floor((Math.random() * 10) + 1);
            var teacherData = {
                email: passwordData.email,
                actualPassword: actualPassword
            };
            req.store.set('teacher', teacherData);
            var hash = bcrypt.hashSync(actualPassword, salt);
            teacherslib.updateTeacher({
                email: passwordData.email,
                enabled: true
            }, {
                password: hash
            }, function(err) {
                debug(err);
            });
        } else { //no email exists
            res.response = {
                code: '501',
                'heading': 'No Account Exist',
                'message': 'No login exists for this teacher. Please check with app administrator to have account added.'
            };
        }
        next();
    });
};

exports.sendForgotPasswordEmail = function(req, res, next) {
    var userObject  = req.store.get('teacher');
    var data        = {};
    data.email      = userObject.email;
    data.password   = userObject.actualPassword;
    data.subject    = 'Forgot Password';
    data.from       = 'First 5 Shasta <noreply@ebbex.com>';
    var options;
    options = {
        template: 'resetPasswordTemplate'
    };
    var Emailer     = require('../../lib/generateEmails');
    var emailer     = new Emailer(options, data);
    emailer.send(function(err, emailResults) {
        /*jshint unused:false*/
        if (err) {
            //debug('error sending emails', err);
            //req.flash('error', 'Error sending confirmation email');
            //return res.redirect('/teachers');
            res.response = {
                code: '400',
                'heading': 'Error',
                'message': 'Error sending confirmation email to ' + userObject.email
            };
        } else {
            //req.flash('info', 'An e-mail has been sent to ' + userObject.email + ' with further instructions.');
            next();
        }
    });
};

// exports.validations = function(req, res, next) {
//   //check for missing params
//   //chack for valid email ids
//   var teachers = req.store.get('teachers');
//   if(!isValidPin(teachers.pin)) {
//     // return next(new Unauthorized('Pin is not valid'));
//     return next(new Unauthorized(errMsg['1001'], 1001));
//   }
//   next();
// };
exports.validations = function(req, res, next) {
    var teachers = req.store.get('teachers');
     var dateObj = new Date(),
       currentYear = dateObj.getFullYear(),
       previousYear = currentYear-1,
       yearRange = previousYear+'-'+currentYear;
    if (teachers.pin) {
        teacherslib.getAppSettingByAttr({assessment_year:yearRange}, function (err, appSetting) {
            if (err) {
                req.flash('error', 'Something Went Wrong');
            } else {

              if(appSetting){
                if(appSetting.pin.toString()===teachers.pin.toString()){
                    if (!common.isEmailValid) {
                        return next(new Unauthorized(errMsg['1021'], 1021));
                    }
                    next();
                }else {
                    return next(new Unauthorized(errMsg['1001'], 1001));
                }
             }else {
                    return next(new Unauthorized(errMsg['1001'], 1001));
                }
  
            }
        });
    }
};


exports.getTeacher = function(req, res, next) {
    var teachers = req.store.get('teachers');

    teacherslib.findTeacher({
        email: teachers.email,
        enabled: true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher) {
            // return next(new BadRequest('A teacher with same email address already exists'));
            return next(new BadRequest(errMsg['1002'], 1002));
        }
        next();
    });
};


exports.checkTeacherByAdmin = function(req, res, next) {
    var teachers = req.store.get('teachers');
    teacherslib.findTeacher({
        email: teachers.email,
        enabled: true, active:true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher) {

            res.json({success:false, data:[],message:[{message:'Email already exist. '}]});
        } else {
            next();
        }
    });
};

exports.checkTeacher = function(req, res, next) {
    var teachers = req.store.get('teachers');
    teacherslib.findTeacher({
        email: teachers.email,
        enabled: true, active:true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher) {
            req.flash('error', errMsg['1002']);
            res.redirect('/teachers');
        } else {
            next();
        }
    });
};


exports.processSchoolMasterData = function(req, res, next) {
    if (_.contains(req.accepts(), 'text/html')) {
        var schoolId = utils.toObjectId(req.params.id);
        req.store.set('schoolId', schoolId);
        next();
    }
    var schoolName = req.body.school;
    var districtId = req.store.get('districtId');
    schoolslib.getSchools({
        name: schoolName,
        distId: districtId
    }, function(err, schools) {
        if (err) {
            return next(err);
        }
        if (schools.length > 0) { //county exists, use the same countyId
            var schoolId = schools[0]._id;
            req.store.set('schoolId', schoolId);
            next();
        } else { //insert county
            schoolslib.create({
                name: schoolName,
                distId: districtId,
                active: true,
                enabled: true,
                created: new Date().getTime(),
                createdIso: new Date().toISOString(),
                updated: new Date().getTime(),
                updatedIso: new Date().toISOString()
            }, function(err, schools) {
                if (err) {
                    return next(err);
                }
                var schoolId = schools[0]._id;
                req.store.set('schoolId', schoolId);
                next();
            });
        }
    });
};



exports.getTeacherName = function(req, res, next) {
    if (req.params.tid) {
        teacherslib.findTeacher({
            _id: utils.toObjectId(req.params.tid),
            enabled: true, active:true
        }, function(err, teacher) {
            if (err) {
                return next(err);
            }
            req.store.set('teacher', teacher);
            next();
        });
    } else {
        return next();
    }
};
/**
 * Extract params from a multipart request
 */
exports.extractTeacherParamsForPost = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var teachers = {};
            var data = req.body;
             teachers.firstName  = data.firstName;
             teachers.lastName   = data.lastName;
             teachers.email      = data.email.toLowerCase();
             teachers.active     = true;
             teachers.enabled    = true;
             if(data.admin_teacher){
                teachers.admin_teacher = data.admin_teacher
              }else{
                  teachers.admin_teacher = '1';
              }
             req.params.id       = data.e3;

       // }
        
         req.store.set('teachers', teachers);
         next();
   // });
};


exports.processCountyMasterData = function(req, res, next) {
    var countyName = req.body.county;
    districtslib.getCounties({
        name: countyName,enabled: true, active:true
    }, function(err, counties) {
        if (err) {
            return next(err);
        }
        if (counties.length > 0) { //county exists, use the same countyId
            var countyId = counties[0]._id;
            req.store.set('countyId', countyId);
            next();
        } else { //insert county
            districtslib.createCounty({
                name: countyName,
                active: true,
                enabled: true,
                created: new Date().getTime(),
                createdIso: new Date().toISOString(),
                updated: new Date().getTime(),
                updatedIso: new Date().toISOString()
            }, function(err, counties) {
                if (err) {
                    return next(err);
                }
                var countyId = counties[0]._id;
                req.store.set('countyId', countyId);
                next();
            });
        }
    });
};


exports.processDistrictMasterData = function(req, res, next) {
    var districtName = req.body.district;
    var countyId = req.store.get('countyId');
    districtslib.getDistricts({
        name: districtName,
        countyId: countyId,enabled: true, active:true
    }, function(err, districts) {
        if (err) {
            return next(err);
        }
        if (districts.length > 0) { //county exists, use the same countyId
            var districtId = districts[0]._id;
            req.store.set('districtId', districtId);
            next();
        } else { //insert county
            districtslib.createDistrict({
                name: districtName,
                countyId: countyId,
                active: true,
                enabled: true,
                created: new Date().getTime(),
                createdIso: new Date().toISOString(),
                updated: new Date().getTime(),
                updatedIso: new Date().toISOString()
            }, function(err, districts) {
                if (err) {
                    return next(err);
                }
                var districtId = districts[0]._id;
                req.store.set('districtId', districtId);
                next();
            });
        }
    });
};


exports.processTeacherSchoolMasterData = function(req, res, next) {
    if (_.contains(req.accepts(), 'text/html')) {
        var schoolId = utils.toObjectId(req.params.e3);
        req.store.set('schoolId', schoolId);
        next();
    }
    var schoolName = req.body.school;
    var districtId = req.store.get('districtId');
    schoolslib.getSchools({
        name: schoolName,
        distId: districtId,enabled: true, active:true
    }, function(err, schools) {
        if (err) {
            return next(err);
        }
        if (schools.length > 0) { //county exists, use the same countyId
            var schoolId = schools[0]._id;
            req.store.set('schoolId', schoolId);
            next();
        } else { //insert county
            schoolslib.create({
                name: schoolName,
                distId: districtId,
                active: true,
                enabled: true,
                created: new Date().getTime(),
                createdIso: new Date().toISOString(),
                updated: new Date().getTime(),
                updatedIso: new Date().toISOString()
            }, function(err, schools) {
                if (err) {
                    return next(err);
                }
                var schoolId = schools[0]._id;
                req.store.set('schoolId', schoolId);
                next();
            });
        }
    });
};


exports.createTeacher = function(req, res, next) {
    var teachers    = req.store.get('teachers');
    var schoolId    = req.store.get('schoolId');
    teachers        = _.omit(teachers, 'pin');
    teachers        = _.omit(teachers, 'actualPassword');
    var actualPassword  = passwordOption[Math.floor(Math.random() * passwordOption.length)] + Math.floor((Math.random() * 10) + 1);
    var bcrypt  = require('bcrypt');
    var salt    = bcrypt.genSaltSync(10);
    var hash    = bcrypt.hashSync(actualPassword, salt);
    teachers.actualPassword = actualPassword;
    teachers.password   = hash;

    // teachers.schoolId = utils.toObjectId(req.params.id);
    teachers.schoolId   =  utils.toObjectId(req.body.e3);
    teachers.created    = new Date().getTime();
    teachers.createdIso = new Date().toISOString();
    teachers.updated    = new Date().getTime();
    teachers.updatedIso = new Date().toISOString();
    teachers.isLoggedIn = 0;
     
     teacherslib.create(teachers, function(err, teachers) {
        if (err) {
            return next(err);
        }else{
        var data        = {};
        data.email      = req.body.email;
        data.password   = actualPassword;
        data.subject    = 'KRS Sign up Confirmation';
        data.from       = 'First 5 Shasta <noreply@ebbex.com>';
        var options;
       
        options = {
            template: 'Primal_new_subscriber_edited'
        };
        var Emailer = require('../../lib/generateEmails');
        var emailer = new Emailer(options, data);
        emailer.send(function(err, emailResults) {
            /*jshint unused:false*/
            if (err) {
                
            } else {
                 
            }
        });
        req.store.set('updateCountBy', 1);
        req.store.set('teacher', teachers.shift());
        res.response = teachers.shift();
        next();
      }
    });
};

exports.create = function(req, res, next) {
    var teachers    = req.store.get('teachers');
    var schoolId    = req.store.get('schoolId');
    teachers        = _.omit(teachers, 'pin');
    teachers        = _.omit(teachers, 'actualPassword');
    // teachers.schoolId = utils.toObjectId(req.params.id);
    teachers.schoolId   = utils.toObjectId(schoolId);
    teachers.created    = new Date().getTime();
    teachers.createdIso = new Date().toISOString();
    teachers.updated    = new Date().getTime();
    teachers.updatedIso = new Date().toISOString();
    teachers.isLoggedIn = 0;
    teachers.admin_teacher = '1';
    
    teacherslib.create(teachers, function(err, teachers) {
        if (err) {
            return next(err);
        }
        req.store.set('updateCountBy', 1);
        req.store.set('teacher', teachers.shift());
        res.response = teachers.shift();
        next();
    });
};

/**
 * Extract params from a multipart request
 */
exports.extractParamsForPost = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var teachers = {};
    form.parse(req, function(err, fields) {
        if (err) {
            //debug('error parsing multipart request ',  err);
            req.flash('error', 'Bad Request');
            return res.render('/teachers');
        } else {
            //var keys = Object.keys(fields);
            teachers.firstName  = fields.firstName;
            teachers.lastName   = fields.lastName;
            teachers.email      = fields.email.toLowerCase();
            var actualPassword  = passwordOption[Math.floor(Math.random() * passwordOption.length)] + Math.floor((Math.random() * 10) + 1);
            var bcrypt  = require('bcrypt');
            var salt    = bcrypt.genSaltSync(10);
            var hash    = bcrypt.hashSync(actualPassword, salt);
            teachers.actualPassword = actualPassword;
            teachers.password   = hash;
            teachers.active     = true;
            teachers.enabled    = true;

            if(fields.admin_teacher){
                teachers.admin_teacher = fields.admin_teacher
            }else{
                teachers.admin_teacher = '1';
            }

            req.params.id       = fields.e3;
        }
        req.store.set('teachers', teachers);
        next();
    });
};


exports.sendResponse = function(req, res, next) {
    var teachers = req.store.get('teacher');
    res.response = teachers;
    next();
};


exports.extractParamsForEditPost = function(req, res, next) { 
   // var form = new formidable.IncomingForm();
    var teachers = {};
    var data = req.body;
    //form.parse(req, function(err, fields) {
       // if (err) {
            //debug('error parsing multipart request ',  err);
         //   req.flash('error', 'Bad Request');
         //   return res.render('/teachers');
       // } else {
            teachers.firstName  = data.editFirstName;
            teachers.lastName   = data.editLastName;
            teachers.email      = data.editEmail.toLowerCase();
            teachers._id        = data.editTeacherId;
            teachers.schoolId   = utils.toObjectId(data.editschool);
            if(typeof data.editadmin_teacher === undefined)
            {
                teachers.admin_teacher  = '1';
            }else{
                teachers.admin_teacher  = data.editadmin_teacher;
            }
       // }
       
        req.store.set('teachers', teachers);
        next();
   // });
};

exports.checkEditTeacher = function(req, res, next) {
  
    var teachers = req.store.get('teachers');
    teacherslib.findTeacher({
        email: teachers.email,
        enabled: true, active:true
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher && teacher._id.toString() !== teachers._id.toString()) {
           // req.flash('error', errMsg['1002']);
            //res.redirect('/teachers');
            res.json({success:false, data:[],message:[{message:'Teacher with this mail-id already exist.'}]});
        } else {
            next();
        }
    });
};

exports.update      = function(req, res, next) {
    var teachers    = req.store.get('teachers');
    var teacherId   = teachers._id;
    teachers        = _.omit(teachers, 'pin');
    teachers        = _.omit(teachers, '_id');
    teachers.updated    = new Date().getTime();
    teachers.updatedIso = new Date().toISOString();
    //teacherslib.update(teachers, function(err, teachers) {
    teacherslib.updateTeacher({
        _id: utils.toObjectId(teacherId)
    }, teachers, function(err) {
        if (err) {
            return next(err);
        }
        next();
    });
};



exports.sendEmail   = function(req, res, next) {
    var userObject  = req.store.get('teachers');
    var data        = {};
    data.email      = userObject.email;
    data.password   = userObject.actualPassword;
    data.subject    = 'KRS Sign up Confirmation';
    data.from       = 'First 5 Shasta <noreply@ebbex.com>';
    var options;
    options = {
        template: 'Primal_new_subscriber_edited'
    };
    var Emailer = require('../../lib/generateEmails');
    var emailer = new Emailer(options, data);
    emailer.send(function(err, emailResults) {
        /*jshint unused:false*/
        if (err) {
            //debug('error sending emails', err);
            //req.flash('error', 'Error sending confirmation email');
            //req.flash('error',JSON.stringify(err));
            //return res.redirect('/teachers');
            next();
        } else {
            //req.flash('info', 'An e-mail has been sent to ' + userObject.email + ' with further instructions.');
            next();
        }
    });
};

exports.resendPassword = function(req, res, next){
  var data = req.body;
  var teacherId = data.id;
  var emailData        = {};
  var teacherObj = {};
     teacherslib.getTeachers({_id:utils.toObjectId(data.id)}, function(err, teacher) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
           if(teacher){
              var bcrypt              = require('bcrypt');
              var salt                = bcrypt.genSaltSync(10);
              var actualPassword      = passwordOption[Math.floor(Math.random()*passwordOption.length)]+Math.floor((Math.random() * 10) + 1);
              teacherObj.actualPassword  = actualPassword;
              var hash      = bcrypt.hashSync(actualPassword, salt);
              teacherslib.updateTeacher({_id: utils.toObjectId(teacherId), enabled: true},{password:hash},function(err){
              debug(err);
              });

             //console.log(actualPassword);
              emailData.email      = data.email;
              emailData.password   = actualPassword;
              emailData.subject    = 'KRS Sign up Confirmation';
              emailData.from       = 'First 5 Shasta <noreply@ebbex.com>';
              var options;
              options = {
                  template: 'Primal_new_subscriber_edited'
              };
              
              var Emailer = require('../../lib/generateEmails');
              var emailer = new Emailer(options, emailData);
              emailer.send(function(err, emailResults) {
                  /*jshint unused:false*/
                  if (err) {
                    // res.json({success:false,data:err,message:'please try again.'});
                  } else {
                     // res.json({success:true,data:emailResults,message:'Invitation successfully sent.'});
                  }
              });


               res.json({success:true,data:[],message:'Invitation successfully sent.'});
           }else{
              res.json({success:false,data:[],message:'Teacher not found.'});
           }
        }
      });
};

exports.getTeachersActivityListData = function(req, res, next) { 
  var reqData = req.query;
  var teachersArr = [];
  var literacyArr = [];
  var numeracyArr = [];
  var socialArr = [];
  var schoolArr = [];
  var countyArr = [];
  var districtArr = [];
  


     async.waterfall([
         
         function literacy(callback){
             var literacyCondition = {active:true, enabled: true};
                      if(reqData.from_date && reqData.to_date){
                        literacyCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                      }

                  literacylib.getStudents(literacyCondition,function(err,literacy) {
                    if (err) {
                     callback(err);
                    }else{
                       literacyArr = literacy;
                      callback(null,literacy);
                    }
                  });   
             
            },
            function numeracy(literacy, callback){
             var numeracyCondition = {active:true, enabled: true};
                      if(reqData.from_date && reqData.to_date){
                        numeracyCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                      }

                  numeracylib.getStudents(numeracyCondition,function(err,numeracy) {
                    if (err) {
                     callback(err);
                    }else{
                       numeracyArr = numeracy;
                      callback(null,literacy, numeracy);
                    }
                  });   
             
            },
            function social(literacy, numeracy, callback){
             var socialCondition = {active:true, enabled: true};
                      if(reqData.from_date && reqData.to_date){
                        socialCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                      }

                  sociallib.getStudents(socialCondition,function(err,social) {
                    if (err) {
                     callback(err);
                    }else{
                      socialArr = social;
                      callback(null,literacy, numeracy, social);
                    }
                  });   
             
            },
            function schools(literacy, numeracy, social, callback){
             var schoolCondition = {active:true, enabled: true};
                //       if(reqData.from_date && reqData.to_date){
                //   schoolCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                // }

                  schoolslib.getSchools(schoolCondition,function(err,schools) {
                    if (err) {
                     callback(err);
                    }else{
                      schoolArr = schools;
                      callback(null,literacy, numeracy, social,schools);
                    }
                  });   
             
            },
            function county(literacy, numeracy, social, schools, callback){
             var  countyCondition = {active:true, enabled: true};
                  districtslib.getCounties(countyCondition,function(err,counties) {
                    if (err) {
                     callback(err);
                    }else{
                      countyArr = counties;
                      callback(null,literacy, numeracy, social,schools, counties);
                    }
                  });   
             
            },
            function districts(literacy, numeracy, social, schools, counties, callback){
             var  districtCondition = {active:true, enabled: true};
                  districtslib.getDistricts(districtCondition,function(err,districts) {
                    if (err) {
                     callback(err);
                    }else{
                      districtArr = districts;
                      callback(null,literacy, numeracy, social,schools, counties, districts);
                    }
                  });   
             
            },
            function teachers(literacy,numeracy, social, schools, counties, districts,callback){
              //var teachersCondition = {enabled: true,active:true,$or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]};
                var teachersCondition = {enabled: true,active:true};
                if(reqData.from_date && reqData.to_date){
                  teachersCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                }

              teacherslib.getTeachers(teachersCondition, function(err, teachers) {
                  if (err) {
                      callback(err);
                  }else{
                      teachersArr = teachers;
          
                async.forEachOf(teachersArr, function(data, key, asynCallback) {
                    
                        var teachersLiteracyArr = literacyArr.filter(function(litObj){
                             return litObj.teacherId.toString() == data._id.toString();
                        });

                        var teachersNumeracyArr = numeracyArr.filter(function(numObj){
                             return numObj.teacherId.toString() == data._id.toString();
                        });

                        var teachersSocialArr = socialArr.filter(function(socObj){
                             return socObj.teacherId.toString() == data._id.toString();
                        });

                        var teachersSchool = schoolArr.filter(function(socObj){
                             return socObj._id.toString() == data.schoolId.toString();
                        });
                        
                        if(teachersSchool.length){
                        var teachersDistrict = districtArr.filter(function(distObj){
                             return distObj._id.toString() == teachersSchool[0].distId.toString();
                        });
                        teachersArr[key].district_name = (teachersDistrict.length) ? teachersDistrict[0].name : '-';
                           teachersArr[key].distId = (teachersDistrict.length) ? teachersDistrict[0].name : '-';
                        

                        if(teachersDistrict.length){
                           var teachersCounty = countyArr.filter(function(countyObj){
                             return countyObj._id.toString() == teachersDistrict[0].countyId.toString();
                            });

                           teachersArr[key].county_name = (teachersCounty.length) ? teachersCounty[0].name : '-';
                           teachersArr[key].county_id = (teachersCounty.length) ? teachersCounty[0]._id : '';
                        }else{
                           teachersArr[key].district_name = '-';
                           teachersArr[key].distId = '';     
                        }
                      }else{
                          teachersArr[key].county_name = '-';
                          teachersArr[key].county_id = '';
                          teachersArr[key].district_name = '-';
                          teachersArr[key].distId = '';
                      }
                        teachersArr[key].literacy_count = teachersLiteracyArr.length;
                        teachersArr[key].numeracy_count = teachersNumeracyArr.length;
                        teachersArr[key].social_count = teachersSocialArr.length;
                        teachersArr[key].schoolName = (teachersSchool.length) ? teachersSchool[0].name : '-';
                       
                       var studentsCondition = {active:true, enabled: true, teacherId:utils.toObjectId(data._id)};
                        if(reqData.from_date && reqData.to_date){
                           studentsCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                        } 

                       studentslib.StudentsCount(studentsCondition,function(err,student_count){
                            if (err) {
                                return next(err);
                            }
                            teachersArr[key].student_count = student_count;
                            asynCallback();
                        }); 

                 

                },function(err){
                   if(err){
                       callback(err);
                   }else{
                      callback(null, literacy, numeracy, social, teachers, schools);
                   }
                })





                      
                        
                       
                  }

                });
             
            }
          
      ], function (err, result) {
        if(err){
          res.json({success:false,data:[],message:'Something went wrong.'});
        }else{
            res.json({success:true, data:teachersArr, message:'All teachers list.'});
        }
        
      });


 
     

};

exports.getTeachersActivityList = function(req, res, next) {  
    var query = req.store.get('query');
    var teacherQuery = {
        enabled: true,
        active:true
    };
    var searchQuery = '';
    if (!_.isUndefined(query)) {
        if (query.trim() != '') {
            teacherQuery = {
                enabled: true,
                active:true,
                $text: {
                    $search: query
                }
            };
            searchQuery = query;
        }
    }

    var data = req.query;

    if(data.from_date && data.to_date){
      teacherQuery.createdIso = {$gte:data.from_date, $lte:data.to_date};
    }
     
    teacherslib.getTeachers(teacherQuery, function(err, teachers) {
        if (err) {
            return next(err);
        }
        var schools         = req.store.get('schools');
        var districts       = req.store.get('districts');
        var counties        = req.store.get('counties');
        //var students_count1 = 0;
        var students_count  = null;
        var literacy_count  = null;
        var numeracy_count  = null;
        var social_count    = null;
        var isAdmin_teacher = null;
        var student_count   = [];
        var completed       = 0; 
        for (var i = 0; i < teachers.length; i++) {
            teachers[i].schoolName = "";
            for (var j = 0; j < schools.length; j++) {
              if(teachers[i].schoolId && schools[j]._id){
                if (teachers[i].schoolId.toString() === schools[j]._id.toString()) {
                    teachers[i].schoolName = schools[j].name;
                    teachers[i].distId = schools[j].distId;
                    break;
                }
              }
            }
            teachers[i].district_name = "";
            teachers[i].county_id = "";
            for (var k = 0; k < districts.length; k++) {
              if(teachers[i].distId){
                if (districts[k]._id.toString() === teachers[i].distId.toString()) {
                    teachers[i].district_name = districts[k].name;
                    teachers[i].county_id = districts[k].countyId;
                    break;
                }
              }
            }
            teachers[i].county_name = "";
            for (var l = 0; l < counties.length; l++) {
                if (counties[l]._id.toString() === teachers[i].county_id.toString()) {
                    teachers[i].county_name = counties[l].name;
                    break;
                }
            }
            teachers[i].loggedintime = new Date(teachers[i].updatedIso).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        // async function starts
            async.series({
                students_count: function(callback) {
                    var teachersCountCondition = {teacherId: teachers[i]._id,enabled: true, active:true}; 
                     if(data.from_date && data.to_date){
                         teachersCountCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      }
                    studentslib.StudentsCountByTeacherId(teachersCountCondition,i,function(err,students_arr){
                        if (err) {
                            return next(err);
                        }
                        students_count = students_arr;
                        callback(null, students_count);
                    });
                },
                literacy_count: function(callback) {
                     var literacyCountCondition = {teacherId: students_count.teacher_id,enabled: true, active:true}; 
                     if(data.from_date && data.to_date){
                         literacyCountCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      }
                     
                    var index  = students_count.resindex
                    literacylib.getCountByTeacherId(literacyCountCondition,index, function(err, literacy_arr) {
                        if (err) {
                            return next(err);
                        }
                        literacy_count = literacy_arr;
                        callback(null, literacy_count);
                    });
                },
                numeracy_count: function(callback) {
                     var numeracyCountCondition = {teacherId: literacy_count.teacher_id,enabled: true, active:true}; 
                     if(data.from_date && data.to_date){
                         numeracyCountCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      }
                    
                     var index  = literacy_count.resindex
                    numeracylib.getCountByTeacherId(numeracyCountCondition,index, function(err, numeracy_arr) {
                        if (err) {
                            return next(err);
                        }
                        numeracy_count = numeracy_arr;
                        callback(null, numeracy_count);
                    });
                },
                social_count: function(callback) {
                    var socialCountCondition = {teacherId: numeracy_count.teacher_id,enabled: true, active:true}; 
                     if(data.from_date && data.to_date){
                         socialCountCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      }
                     

                    var index  = numeracy_count.resindex
                    sociallib.getCountByTeacherId(socialCountCondition,index, function(err, social_arr) {
                        if (err) {
                            return next(err);
                        }
                        social_count = social_arr;
                        callback(null, social_count);
                    });
                },
            }, function(err, results) {
                //students_count1+= results.students_count['count'];
                teachers[results.students_count['resindex']].student_count  = results.students_count['count'];
                teachers[results.literacy_count['resindex']].literacy_count = results.literacy_count['count'];
                teachers[results.numeracy_count['resindex']].numeracy_count = results.numeracy_count['count'];
                teachers[results.social_count['resindex']].social_count     = results.social_count['count'];
                complete();
            });
        // async function ends
        }
        var complete = function() {
            completed++;
            if (completed === teachers.length - 1) {
                req.store.set('searchQuery', searchQuery);
                req.store.set('teachers', teachers);
                if(teachers){
                    res.json({success:true, data:teachers, message:'Teachers Activity list'});
                }else{
                    res.json({success:false, data:[], message:'Something Went Wrong'});
                }
            }
        }

       if(!teachers.length){
        res.json({success:true, data:[], message:'Teachers Activity list'});
       }
    });

   
    
};


exports.getTeachersList = function(req, res, next) {
    var school = req.store.get('school');
    teacherslib.getTeachers({
        schoolId: school._id,
        enabled: true, active:true
    }, function(err, teachers) {
        if (err) {
            return next(err);
        }
        req.store.set('teachers', teachers);
        next();
    });
};

exports.getAllTeachers = function(req, res, next) {
     teacherslib.getTeachers({
        enabled: true, active:true
    }, function(err, teachers) {
        if (err) {
            return next(err);
        }
        req.store.set('teachers', teachers);
        next();
    });
};


exports.getAllTeachersList = function(req, res, next) {
  var teachersArr = [],
      countiesArr =[],
      districtsArr =[],
      schoolesArr =[],
      teachersCount = 0,
      adminTeachersCount = 0;
      
   async.waterfall([
        function teachers(callback){
         var teacherQuery = {
              enabled: true, active:true
          };
          teacherslib.getTeachers(teacherQuery, function(err, teachers) {
            if (err) {
                return next(err);
            }else{
              teachersArr = teachers;
              callback(null, teachers);
            }
          });
         
        },
         function county(teachers, callback){
             districtslib.getCounties({enabled: true, active:true}, function(err, counties) 
                {
                    if (err) {
                        return next(err);
                    }else{
                       countiesArr = counties;
                       callback(null, teachers,counties);
                    }
                });
             
            },
          function district(teachers, counties, callback){
             districtslib.getDistricts({enabled: true, active:true}, function(err, districts) 
                {
                    if (err) {
                        return next(err);
                    }else{
                       districtsArr = districts;
                       callback(null, teachers,counties, districts);
                    }
                });
             
            }, 
            function teachesCount(teachers, counties, districts, callback){
               
                teacherslib.TeachersCount({$or : [{admin_teacher : 1},{admin_teacher : 1.0},{admin_teacher : '1.0'},{admin_teacher : '1'}], enabled: true, active:true},function(err,normal_teacher_count) {
                    if (err) {
                        return next(err);
                    }
                   teachersCount = normal_teacher_count;
                   callback(null, teachers,counties, districts, teachersCount);
                });
             
            }, 
            function adminTeachesCount(teachers, counties, districts, teachersCount, callback){
               
               teacherslib.TeachersCount({$or : [{admin_teacher : 2},{admin_teacher : '2'}], enabled: true, active:true},function(err,admin_teacher_count) {
                  if (err) {
                      return next(err);
                  }else{
                    adminTeachersCount = admin_teacher_count;
                    callback(null, teachers,counties, districts, teachersCount, adminTeachersCount);
                  }
              });
             
            },  
           function schooles(teachers, counties, districts, teachersCount, adminTeachersCount, callback){
               
               schoolslib.getSchools({enabled: true, active:true},function(err,schooles) {
                  if (err) {
                      return next(err);
                  }else{
                    schoolesArr = schooles;
                    callback(null, teachers,counties, districts, teachersCount, adminTeachersCount,schooles);
                  }
              });
             
            },  
        
      ], function (err, result) {
        if(err){
          res.json({success:false,data:[],message:'Something went wrong.'});
        }else{
         // result now equals 'done' 
          var data = {teachers:teachersArr, counties:countiesArr, districts:districtsArr, 
                      teachersCount:teachersCount, adminTeacherCount:adminTeachersCount, schooles:schoolesArr};
          res.json({success:true, data:data, message:'All teachers list.'});
        }
        
      });

  
  
};
exports.getCompleteTeachersList = function(req, res, next) {
    var query = req.store.get('query');
    if(req.query.admin_teacher==2 || req.query.admin_teacher=='2'){
    var teacherQuery = {
        enabled: true, active: true,
        $or:[{admin_teacher:2},{admin_teacher:'2'}]
    };
  }else{
   var teacherQuery = {
        enabled: true, active: true,
        $or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]
    };
  }
    var searchQuery = '';
    if (!_.isUndefined(query)) {
        if (query.trim() != '') {
            teacherQuery = {
                enabled: true, active: true,
                $text: {
                    $search: query
                }
            };
            searchQuery = query;
        }
    }
    teacherslib.getTeachers(teacherQuery, function(err, teachers) { 
        if (err) {
            return next(err);
        }
        var schools         = req.store.get('schools');
        var districts       = req.store.get('districts');
        var counties        = req.store.get('counties');
        var students_count  = null;
        var isAdmin_teacher = null;
        var student_count   = [];
        var completed       = 0;
        for (var i = 0; i < teachers.length; i++) {
            teachers[i].schoolName = "";
            for (var j = 0; j < schools.length; j++) {
                if (teachers[i].schoolId.toString() === schools[j]._id.toString()) {
                    teachers[i].schoolName = schools[j].name;
                    teachers[i].distId = schools[j].distId;
                    break;
                }
            }
            teachers[i].district_name = "";
            teachers[i].county_id = "";
            for (var k = 0; k < districts.length; k++) {
              if(teachers[i].distId){
                if (districts[k]._id.toString() === teachers[i].distId.toString()) {
                    teachers[i].district_name = districts[k].name;
                    teachers[i].county_id = districts[k].countyId;
                    break;
                }
              }
            }
            teachers[i].county_name = "";
            for (var l = 0; l < counties.length; l++) {
                if (counties[l]._id.toString() === teachers[i].county_id.toString()) {
                    teachers[i].county_name = counties[l].name;
                    break;
                }
            }
            teachers[i].loggedintime = new Date(teachers[i].updatedIso).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            // async function starts
            async.series({
                students_count: function(callback) {
                    studentslib.StudentsCountByTeacherId({
                        teacherId: teachers[i]._id,enabled: true, active:true
                    }, i, function(err, students_arr) {
                        if (err) {
                            return next(err);
                        }
                        students_count = students_arr;
                        callback(null, students_count);
                    });
                },
            }, function(err, results) {
                teachers[results.students_count['resindex']].student_count = results.students_count['count'];
                complete();
            });
            // async function ends

            // adding admin teacher's email id start's
            if (teachers[i].admin_teacher == 1 || teachers[i].admin_teacher == '1' || teachers[i].admin_teacher == '1.0' ||teachers[i].admin_teacher == 1.0) {
                IsadminTeacher(teachers[i]._id, i, function(data) {
                    if (typeof data.admin_email != 'undefined') {
                        teachers[data.resindex].admin_teacher_email = data.admin_email.email;
                        //console.log(teachers[data.resindex]);
                    } else {
                        teachers[data.resindex].admin_teacher_email = '';
                    }
                    complete();
                });
            }
            // adding admin teacher's email id end's
        }
        var complete = function() {           
             if (completed === teachers.length - 1) {
                req.store.set('searchQuery', searchQuery);
                req.store.set('teachers', teachers);
                next();
            }
             completed++;
        }
      
        if(!teachers.length){
            req.store.set('searchQuery', searchQuery);
            req.store.set('teachers', teachers);
                next();
        }
    });
};

// added by Vivek starts

function IsadminTeacher(id,index,callback)
{
    

teacherslib.searchTeacher({ associated_teachers_id :utils.toObjectId(id),enabled: true, active:true, $or : [{admin_teacher : 2},{admin_teacher : '2'}]}, index ,function(err, teacher) {
        if (err) {
            return next(err);
        }
        if(teacher)
        {
            callback(teacher);
        }        
    });
}

exports.disableTeacher = function(req, res, next) {
    var teacherId = req.store.get('teacherId');
    teacherslib.findTeacher({ _id: utils.toObjectId(teacherId), enabled: true, active:true }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (teacher.admin_teacher=='2' || teacher.admin_teacher==2)
        {
            teacherslib.updateTeacher({ _id: utils.toObjectId(teacherId)},{associated_teachers_id: ['']}, function(err, numRemoved) { });
        }
        teacherslib.updateTeacher({ _id: utils.toObjectId(teacherId)},{enabled: false, active:false}, function(err, numRemoved){
            if (err) {
                req.flash('error', 'Error deleting teacher');
                return res.redirect('/teachers');
            } else {
                if (numRemoved === 0) {
                    req.flash('error', 'No such id exists');
                    return res.redirect('/teachers');
                } else {
                    req.store.set('updateCountBy', 0);
                    next();
                }
            }
        });
        next();
    });
};

exports.deleteTeachers = function(req, res, next) {
   var data=req.body;
   if(data.admin_teacher==1 || data.admin_teacher=='1' || data.admin_teacher=='1.0'|| data.admin_teacher==1.0){
       teacherslib.disableTeachers(data,{}, function(err, numRemoved){
            if (err) {
                 res.json({success:false,data:[],message:'Please try again.'});
            } else {
                 res.json({success:true,data:[],message:'Teachers deleted.'});
            }
        });
   }else{
      teacherslib.disableTeachers(data,{}, function(err, numRemoved){
            if (err) {
                 res.json({success:false,data:[],message:'Please try again.'});
            } else {
                 res.json({success:true,data:[],message:'Teachers deleted.'});
            }
        });
   }

};

exports.teachersReport = function(req, res, next) { 
  var data=req.body;
  if(data.file_name){
     var fileName = data.file_name+'.csv';
    }else{
     var fileName = Math.floor(Math.random() * 1000000000)+'.csv';
    }
  var filePath = path.join(__dirname,'../../public/uploads/' + fileName);
  var csv = json2csv({ data: data.data, fields: data.fields });
   fs.exists(filePath, function(exists) {
        if (exists) {
            fs.unlinkSync(filePath);
             fs.writeFile(filePath, csv, function(err) {
                if (err){
                  res.json({success: false, data: [], message: err});
                }else{
                   res.json({
                                  success: true,
                                  data: {data: [], csv: fileName},
                                  message: 'Teachers list.'
                              });
                } 
              });
          }else{

            fs.writeFile(filePath, csv, function(err) {
                if (err){
                  res.json({success: false, data: [], message: err});
                }else{
                   res.json({
                                  success: true,
                                  data: {data: [], csv: fileName},
                                  message: 'Teachers list.'
                              });
                } 
              });
          }
    });
 
  
           
};

exports.exportPdf = function(req, res, next) { 
  var data=req.body;
  if(data.file_name){
     var fileName = data.file_name+'.pdf';
    }else{
     var fileName = Math.floor(Math.random() * 1000000000)+'.pdf';
    }
  var filePath = path.join(__dirname,'../../public/uploads/' + fileName);
  var options = {};
   fs.exists(filePath, function(exists) {
        if (exists) {
            fs.unlinkSync(filePath);

            pdf.create(data.data, options).toFile(filePath, function(err, result) {
              if (err){
                res.json({success: false, data: [], message: err});
              }else{
                  res.json({
                              success: true,
                              data: {data: [], pdf: fileName},
                              message: 'Pdf report.'
                          });
              };
               
            });          
 
          }else{

              pdf.create(data.data, options).toFile(filePath, function(err, result) {
              if (err){
                 res.json({success: false, data: [], message: err});
              }else{
                //console.log(res);
                  res.json({
                              success: true,
                              data: {data: [], pdf: fileName},
                              message: 'Pdf report.'
                          });
              };
               
            }); 
          }
    });
 
  
           
};

exports.getAssociatedTeachers = function(req, res, next) {
    var admin_teachers_id = utils.toObjectId(req.params.id);
    var teacherQuery = {
        _id: admin_teachers_id
    };
    teacherslib.getTeachers(teacherQuery, function(err, teachers) {
        if (err) {
            return next(err);
        }
        var districts   = req.store.get('districts');
        var counties    = req.store.get('counties');
        var schools     = req.store.get('schools');
                
        if (teachers[0].associated_teachers_id != null || teachers[0].associated_teachers_id != undefined &&  teachers[0].associated_teachers_id.length > 0) {
            async.series({
                all_associated: function(callback) {
                    var query = {
                        _id: {$in: teachers[0].associated_teachers_id},enabled: true, active:true
                    };

                    

                    teacherslib.getTeachers(query, function(err, all_associated) {
                        if (err) {
                            return next(err);
                        }
                        callback(null, all_associated);
                    });
                },
            }, function(err, results) {
                results.teachers_first_name = teachers[0].firstName;
                results.teachers_last_name  = teachers[0].lastName;
                for (var i = 0; i < results.all_associated.length; i++) {
                    var school_id = results.all_associated[i].schoolId;
                    for (var j = 0; j < schools.length; j++) {
                        if (schools[j]._id.toString() === school_id.toString()) {
                            results.all_associated[i].school_name = schools[j].name;
                            var district_id = schools[j].distId;

                            for (var k = 0; k < districts.length; k++) {
                                if (districts[k]._id.toString() === district_id.toString()) {
                                    results.all_associated[i].district_name = districts[k].name;
                                    var county_id = districts[k].countyId;

                                    for (var l = 0; l < counties.length; l++) {
                                        if (counties[l]._id.toString() === county_id.toString()) {
                                            results.all_associated[i].county_name = counties[l].name;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                res.status(200).json({
                    results: results
                });
            });
        }else{

            var results1 = {};
            results1.teachers_first_name = teachers[0].firstName;
            results1.teachers_last_name  = teachers[0].lastName;
            results1.message  = 'No Record Found';
            res.status(200).json({
                    results: results1
            });
        }
    });
}

exports.sendBulkEmailToUsers =  function(req, res, next) {
  var to       =  req.body.to;
    var cc       =  req.body.cc;
    var bcc      =  req.body.bcc;
    var subject  =  req.body.subject;
    var message  =  req.body.message;
    var toarray  =  to.split(',');
    var ccarray  =  cc.split(',');
    var bccarray =  bcc.split(',');
    
    var options;
    var data     = {};
    data.email   = toarray;
    data.cc      = ccarray;
    data.bcc     = bccarray;
    data.from    = 'First 5 Shasta <noreply@ebbex.com>';
    data.subject = subject;
    data.text    = message;
    options = {
        template: 'test'
    };


     var Emailer  = require('../../lib/generateEmails');
     var emailer  = new Emailer(options, data);

    emailer.send(function(err, emailResults) {
        if (err) {
           //res.json({success:false,data:err,message:'Please try again.'}); 
        } else {
           //res.json({success:true,data:emailResults,message:'Email successfully sent.'}); 
        }
    });

    res.json({success:true,data:[],message:'Email successfully sent.'}); 
     
}

exports.sendbulkEmail   = function(req, res, next) {
    var to       =  req.body.to;
    var cc       =  req.body.cc;
    var bcc      =  req.body.bcc;
    var subject  =  req.body.subject;
    var message  =  req.body.message;
    var toarray  =  to.split(',');
    var ccarray  =  cc.split(',');
    var bccarray =  bcc.split(',');

    var options;
    var data     = {};
    data.email   = toarray;
    data.cc      = ccarray;
    data.bcc     = bccarray;
    data.from    = 'First 5 Shasta <noreply@ebbex.com>';
    data.subject = subject;
    data.text    = message;
    options = {
        template: 'test'
    };
    var Emailer  = require('../../lib/generateEmails');
    var emailer  = new Emailer(options, data);
    emailer.send(function(err, emailResults) {
        if (err) {
        } else {
           
        }
    });
     next();
};
// added by Vivek end's

exports.teachersRes = function(req, res, next) {
    var teachers = req.store.get('teachers');
    res.response = teachers;
    next();
};


exports.getId = function(req, res, next) {
    var teacherId = utils.toObjectId(req.params.id.trim());
    req.store.set('id', teacherId);
    next();
};


exports.isTeacherExists = function(req, res, next) {
    var teacherId = req.store.get('id');
    teacherslib.findTeacher({
        _id: teacherId
    }, function(err, teacher) {
        if (err) {
            return next(err);
        }
        if (!teacher) {
            return next(new BadRequest(errMsg['1003'], 1003));
        }
        req.store.set('teacher', teacher);
        req.store.set('teachers', teacher);
        next();
    });
};


exports.edit = function(req, res, next) {
    var params           = req.store.get('teachers');
    var teacherId        = req.store.get('teacher')._id;
    var update           = {};
    update.updated       = new Date().getTime();
    update.updatedIso    = new Date().toISOString();
    if (params.firstName) {
        update.firstName = params.firstName;
    }
    if (params.lastName) {
        update.lastName  = params.lastName;
    }
    teacherslib.updateTeacher({
        _id: teacherId
    }, update, function(err, result) {
        if (err) {
            return next(err);
        }
        if (result > 0) {
            req.store.set('teachers', _.extend(req.store.get('teacher'), update));
        } else {
            req.store.set('teachers', []);
        }
        next();
    });
};

exports.isTeacherAuthorized = function(req, res, next) {
    var store = req.store;
    if (store.teacher._id.toString() !== store.student.teacherId.toString()) {
        return next(new BadRequest(errMsg['1004'], 1004));
    }
    return next();
};

exports.getTeachersFromDist = function(req, res, next) {
    var schoolId = utils.toObjectId(req.params.sid);
    teacherslib.getTeachers({
        schoolId: schoolId,
        enabled: true, active:true
    }, function(err, teachers) {
        if (err) {
            return next(err);
        }
        res.response = teachers;
        next();
    });
};

exports.getTeachers = function(req, res, next) {
  var teachersArr = {"normal_teacher_count": 0,"admin_teacher_count": 0, "data":[],"districts":[],"counties":[],"schooles":[]},
      schoolsArr = [],
      districtsArr = [],
      countyArr = [],
      normalTeachersArr = [];
   if(req.query.admin_teacher==2 || req.query.admin_teacher=='2'){
    var condition = {
        enabled: true, active: true,
        $or:[{admin_teacher:2},{admin_teacher:'2'}]
    };
  }else{
     var condition = {
          enabled: true, active: true,
          $or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]
      };
  }

     async.waterfall([
        function teachers(callback){
          teacherslib.getTeachers(condition, function(err, teachers) {
                if (err) {
                    callback(err);
                }else{
                  teachersArr.data = teachers;
                   callback(null,teachers);
                }
                
            });
         
         },
         function admin_teacher_count(teachers,callback){
          var adminTeacherCondition = { enabled: true, active: true, $or:[{admin_teacher:2},{admin_teacher:'2'}]};
          teacherslib.getTeachers(adminTeacherCondition, function(err, adminTeachers) {
                if (err) {
                    callback(err);
                }else{
                  teachersArr.admin_teacher_count = adminTeachers.length;
                   callback(null,teachers, adminTeachers);
                }
                
            });
         
         },
         function normal_teacher_count(teachers,adminTeachers,callback){
          var normalTeacherCondition = { enabled: true, active: true, $or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]};
          teacherslib.getTeachers(normalTeacherCondition, function(err, normalTeachers) {
                if (err) {
                    callback(err);
                }else{
                  normalTeachersArr = normalTeachers;
                  teachersArr.normal_teacher_count = normalTeachers.length;
                   callback(null,teachers, adminTeachers,normalTeachers);
                }
                
            });
         
         },
         function counties(teachers,adminTeachers,normalTeachers,callback){
           var countyCondition = {active:true, enabled: true};
                 districtslib.getCounties(countyCondition,function(err,counties) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersArr.counties = counties;
                      countyArr = counties;
                        callback(null,teachers, adminTeachers,normalTeachers,counties);
                  }
                  
              });
         },
         function districts(teachers, adminTeachers,normalTeachers,counties, callback){
           var distCondition = {active:true, enabled: true};
                 districtslib.getDistricts(distCondition,function(err,districts) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersArr.districts = districts;
                      districtsArr = districts;
                      callback(null,teachers, adminTeachers,normalTeachers,counties,districts);
                  }
                  
              });
         },
         function schools(teachers, adminTeachers,normalTeachers,counties,districts, callback){
           var schoolCondition = {active:true, enabled: true};
                 schoolslib.getSchoolsData(schoolCondition,{},function(err,schooles) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersArr.schooles = schooles;
                      schoolsArr = schooles;
                      callback(null,teachers, adminTeachers,normalTeachers,counties,districts,schooles);
                  }
                  
              });
         }     
      ], function (err, result) {
        if(err){
          res.json({success:false,data:[],message:'Something went wrong.'});
        }else{
         // result now equals 'done' 
          //res.json({success:true, data:teachersArr, message:'Teachers List.'});
           async.forEachOf(teachersArr.data, function(data, key, asynCallback) {
                        var schoolData = schoolsArr.filter(function(schoolData){
                             return schoolData._id.toString() == data.schoolId.toString(); 
                        });
                        
                        teachersArr.data[key]['schoolName']  = (schoolData.length) ? schoolData[0]['name'] : '' ;

                        if(schoolData.length){
                          var distData = districtsArr.filter(function(districtData){
                             return districtData._id.toString() ==schoolData[0]['distId'].toString(); 
                           });
                          teachersArr.data[key]['district_name'] = (distData.length) ? distData[0]['name'] : '' ;
                          teachersArr.data[key]['distId'] = (distData.length) ? distData[0]['_id'] : '' ;

                          if(distData.length){
                              var countData = countyArr.filter(function(countyData){
                             return countyData._id.toString() ==distData[0]['countyId'].toString(); 
                               });
                              teachersArr.data[key]['county_id'] = (distData.length) ? countData[0]['_id'] : '' ;
                              teachersArr.data[key]['county_name'] = (distData.length) ? countData[0]['name'] : '' ;
                          }
                        }

                        if (data.admin_teacher == 1 || data.admin_teacher == '1' || data.admin_teacher == '1.0' || data.admin_teacher == 1.0) {
                              IsadminTeacher(data._id, key, function(data) {
                                  if (typeof data.admin_email != 'undefined') {
                                       teachersArr.data[key]['admin_teacher_email']  = data.admin_email.email;
                                   } else {
                                       teachersArr.data[key]['admin_teacher_email']  = '';
                                  }                                  
                              });
                          }

                           // Add teachers count field in admin teachers list
                           if(req.query.admin_teacher==2 || req.query.admin_teacher=='2'){
                                teachersArr.data[key]['teachers_count']  = 0;
                              if(data.associated_teachers_id){
                                var teachCount = 0;
                                data.associated_teachers_id.forEach(function(teacherId){
                                   var findTeachers = normalTeachersArr.filter(function(teachObj){
                                     return teachObj._id.toString() ==teacherId.toString(); 
                                    });
                                  teachCount += (findTeachers.length) ? 1 : 0;
                                })
                                teachersArr.data[key]['teachers_count'] =teachCount;
                              } 
                           }
                       
                        var studentsCondition = {active:true, enabled: true, teacherId: utils.toObjectId(data._id)};
                        studentslib.StudentsCount(studentsCondition,function(err,students) {
                            if (err) {
                             callback(err);
                            }else{
                                teachersArr.data[key]['student_count'] = (students) ? students : 0;
                                asynCallback();
                            }
                          });
                      
                      },function(err){
                         if(err){
                            callback(err);
                         }else{
                           res.json({success:true, data:teachersArr, message:'Teachers List.'});
                         }
                      });
        }
        
      });
 
   
};

exports.deleteTeacher = function(req, res, next) {
    var teacherId = req.store.get('teacherId');
    teacherslib.deleteTeacher({
        _id: utils.toObjectId(teacherId)
    }, function(err, numRemoved) {
        if (err) {
            req.flash('error', 'Error deleting teacher');
            return res.redirect('/teachers');
        } else {
            if (numRemoved === 0) {
                req.flash('error', 'No such id exists');
                return res.redirect('/teachers');
            } else {
                req.store.set('updateCountBy', -1);
                next();
            }
        }
    });
};



exports.removeTeacher = function (req, res, next) {
    var teacherId = req.params.id;
    teacherslib.deleteTeacher({_id: utils.toObjectId(teacherId)}, function (err, numRemoved) {
        if (err) {
            req.flash('error', 'Error deleting teacher');
            return res.redirect('/teachers');
        } else {
            if ( numRemoved === 0) {
                req.flash('error', 'No such id exists');
                return res.redirect('/teachers');
            } else {
                req.store.set('updateCountBy', -1);
                next();
            }
        }
    });
};

exports.resendInviteTeacher = function (req, res, next) {
    var teacherId           = req.store.get('teacherId');
    var teacher             = req.store.get('teacher');
    var bcrypt              = require('bcrypt');
    var salt                = bcrypt.genSaltSync(10);
    var actualPassword      = passwordOption[Math.floor(Math.random()*passwordOption.length)]+Math.floor((Math.random() * 10) + 1);
    teacher.actualPassword  = actualPassword;
    req.store.set('teacher',teacher);
    var hash      = bcrypt.hashSync(actualPassword, salt);
    teacherslib.updateTeacher({_id: utils.toObjectId(teacherId), enabled: true},{password:hash},function(err){
    debug(err);
    });
    next();
};

exports.updateTeacherCount = function (req, res, next) {
    var teacher       = req.store.get('teacher');
    var updateCountBy = req.store.get('updateCountBy');
    var schoolId      = teacher.schoolId;

    schoolslib.updateSchool({_id: utils.toObjectId(schoolId)},{$inc: {'noOfTeachers':updateCountBy}},function(err)
    {
        if (err) {
            req.flash('error', 'Error updating teacher count');
        } else {
            next();
        }
    });
};



// get normal teacher's count starts
exports.get_Count_normal_teacher = function(req, res, next){
    teacherslib.TeachersCount({$or : [{admin_teacher : 1},{admin_teacher : '1'},{admin_teacher : 1.0},{admin_teacher:'1.0'}], enabled: true, active:true},function(err,normal_teacher_count) {
        if (err) {
            return next(err);
        }
        req.store.set('normal_teacher_count', normal_teacher_count);
        req.store.normal_teacher_count = normal_teacher_count;
        next();
    });
};
exports.get_Count_admin_teacher = function(req, res, next){
    teacherslib.TeachersCount({$or : [{admin_teacher : 2},{admin_teacher : '2'}], enabled: true, active:true},function(err,admin_teacher_count) {
        if (err) {
            return next(err);
        }
        req.store.set('admin_teacher_count', admin_teacher_count);
        req.store.admin_teacher_count = admin_teacher_count;
        next();
    });
};

// normal teacher's count ends
exports.checkAppStatus = function(req, res, next){
    teacherslib.getAppSetting({}, function (err, appSetting) {
        if (err) {
            req.flash('error', 'Something Went Wrong');
        } else {
            if(appSetting.app_status==false){
                res.json({success:false,code:500,message:'App is deactivated'});
            }else if(appSetting.app_status==true){
                var session_valid = 0;
                var currentDate   = new Date().toISOString();

                if(appSetting.assessment_from && appSetting.assessment_to)
                {
                    var to_date   = appSetting.assessment_to.split('T');
                    var from_date = appSetting.assessment_from.split('T');
                    var cur_date  = currentDate.split('T');
                }
                if(from_date[0]<=cur_date[0] && cur_date[0]<=to_date[0])
                {
                    session_valid = 1;
                }
                res.json({success:true,code:200,pin:appSetting.pin,message:'App is activated',session_valid:session_valid});
            }
        }
    });
}

exports.checkPin = function(req, res, next){
    var pin = req.params.pin;
    teacherslib.getAppSetting({}, function (err, appSetting) {
        if (err) {
            req.flash('error', 'Something Went Wrong');
        } else {
            if(appSetting.pin.toString()===pin.toString()){
                res.json({success:true,code:200,message:'Pin matched'});
            }else if(appSetting.pin.toString()!=pin.toString()){
                res.json({code:500,success:false,message:'Pin not matched'});
            }
        }
    });

}

exports.saveallTeachersbyId = function(req, res, next){
    var id_obj  =   {};
    id_obj      =   req.body.all_ids;
    var array   =   id_obj.split(',');
    var my_Id   =   req.body.my_id;
    var array1  =   [];
    for (var i = 0; i < array.length; i++)
    {
        array1.push(utils.toObjectId(array[i].trim()));
    }  
    teacherslib.updateTeacher({_id: utils.toObjectId(my_Id)}, {'associated_teachers_id':array1}, function (err) {
        if (err) {
            req.flash('error', 'Error saving teachers');
        } else {
            next();
        }
    });
};

exports.removeAssociatedTeacher = function(req, res, next){
    var admin_teachers_id       = utils.toObjectId(req.params.id);
    var removing_teachers_id    = req.params.tid;
    teacherslib.findTeacher({_id: admin_teachers_id,enabled: true, active:true}, function(err, teacher) {
        if (err) {
            return next(err);
        }
        req.store.set('teacher', teacher);
        var result = [];
        var all_associated = teacher.associated_teachers_id;

        for (var i = 0; i < all_associated.length; i++) 
        {
            if(removing_teachers_id.toString().trim()===all_associated[i].toString().trim())
            {
                
            }else{
                result.push(all_associated[i]);
            }
        }
      
        teacherslib.updateTeacher({_id: admin_teachers_id}, {'associated_teachers_id':result}, function (err) {
            if (err) {
              req.flash('error', 'Error updating teachers');
            } else {
              next();
            }
        });
    });
}


function genPin() {
    var date        = new Date();
    var month       = date.getMonth();
    var june        = 5;
    var currentYear, nextYear;
    if(month >= june) {
        currentYear = date.getFullYear();
        nextYear    = date.getFullYear()+1;
    } else {
        currentYear = date.getFullYear()-1;
        nextYear    = date.getFullYear();
    }
    var pin = currentYear.toString().substr(2,2) + nextYear.toString().substr(2,2);
    return pin;
}

function isValidPin(pin) {
    teacherslib.getAppSetting({}, function (err, appSetting) {
        if (err) {
            req.flash('error', 'Something Went Wrong');
        } else {
            if(appSetting.pin.toString()===pin.toString()){
                return true;
            }else {
                return false;
            }
        }
    });
    // var validPin = genPin();
    // if(pin.toString() === validPin) {
    //     return true;
    // }
    // return false;
}





exports.getAppSetting = function(req, res, next){
   var dateObj = new Date(),
       currentYear = dateObj.getFullYear(),
       previousYear = currentYear-1,
       yearRange = previousYear+'-'+currentYear;
  
  teacherslib.getAppSettingByAttr({assessment_year:yearRange}, function(err, appSetting) {
        if (err) {
              res.json({success:false,data:[],message:err});
        }else{
           if(!appSetting){ 
              var data = {pin:genPin(),
                          app_status:true, 
                          assessment_from: currentYear+'-06-01T00:00:00.000Z', 
                          assessment_to:currentYear+'-09-30T00:00:00.000Z', 
                          assessment_year:yearRange};
                teacherslib.createSetting(data, function(err, settings) {
                 if(err){
                    res.json({success:false,data:null,message:err});
                 }else{
                   settings = (settings.length) ? settings[0] : {};
                    res.json({success:true,data:settings,message:'Teachers pin'});
                 }
                });

           }else{
              res.json({success:true,data:appSetting,message:'Teachers pin'});
            }
        }
  });
}
  exports.updateTeachersPin = function(req, res, next){
    var data = req.body;
    var settingId = utils.toObjectId(data.id);
    var setting = {};
        setting.pin = data.pin;
     teacherslib.updateSettings({
        _id: utils.toObjectId(settingId)
      },  setting, function(err) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
           res.json({success:true,data:[],message:'PIN successfully updated.'});
        }
        
    });
};

exports.changeAppStatus = function(req, res, next){
    var data = req.body;
    var settingId = utils.toObjectId(data.id);
    var setting = {};
        setting.app_status = data.app_status;
     teacherslib.updateSettings({
        _id: utils.toObjectId(settingId)
      },  setting, function(err) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
           res.json({success:true,data:[],message:'PIN successfully updated.'});
        }
        
    });
};

exports.updateAssessment = function(req, res, next){
    var data = req.body;
    var settingId = utils.toObjectId(data.id);
    var setting = {};
        setting.assessment_from = data.assessment_from+'T00:00:00.000Z';
        setting.assessment_to   = data.assessment_to+'T00:00:00.000Z';
        var local_date = data.local_date;

        var start = data.assessment_from.split('T');
        var end   = data.assessment_to.split('T');
        var todaysDate = new Date(local_date);
       // end - start returns difference in milliseconds 
       var start = new Date(start[0]);
       var end   = new Date(end[0])
       var diff_date =  end - start;
       var days = Math.floor(((diff_date % 31536000000) % 2628000000)/86400000);
      teacherslib.getAppSetting({_id: utils.toObjectId(settingId)}, function(err, appSetting) {
        var assessment_to = new Date(appSetting.assessment_to);
        var assessment_from = new Date(appSetting.assessment_from);
        
        if(parseInt(days)<0){ 
             res.json({success:false,data:[],message:'To date can bot be less than from date.'});
         }else if(assessment_from.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0) && start.setHours(0,0,0,0) != todaysDate.setHours(0,0,0,0)) {
              res.json({success:false,data:[],message:'As From date is current date, So you can not update it.'});
          }else{
             teacherslib.updateSettings({
              _id: utils.toObjectId(settingId)
            },  setting, function(err) {
              if (err) {
                  res.json({success:false,data:[],message:err});
              }else{
                 res.json({success:true,data:[],message:'Assessment period successfully updated.'});
              }
              
          });
       }
      });
       
};


exports.total_registered_teacher = function(req, res, next){
    teacherslib.TeachersCount({active:true, enabled: true},function(err,registered_teacher) {
         if (err) {
         return next(err);
        }else{
            req.store.set('registered_teacher', registered_teacher);
            next();
        }
        
    });
};
exports.total_loggedin_teacher = function(req, res, next){
    teacherslib.TeachersCount({active:true, enabled: true, isLoggedIn:1},function(err,loggedin_teacher) {
         if (err) {
         return next(err);
        }else{
            req.store.set('loggedin_teacher', loggedin_teacher);
            next();
        }
        
    });
};

exports.teachersDashboardCharts = function(req, res, next){
  var data = req.body;
  var teachersReportObj = {};
  var registered_teacher =[];
  var loggedin_teacher =[];
      async.waterfall([
         function assessmentPeriod(callback){
           var dateObj = new Date(),
               currentYear = dateObj.getFullYear(),
               previousYear = currentYear-1,
               yearRange = previousYear+'-'+currentYear;
          var assessmentYearCondition = {assessment_year:yearRange};
           teacherslib.getAppSettingByAttr(assessmentYearCondition, function (err, appSetting) {
            if (err) {
                 callback(err);
            } else {
                  callback(null,appSetting);
              }
              
          });
         
         },
        function registeredTeachers(appSetting,callback){
          var teacherCondition = {active:true, enabled: true,$or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]};
          if(data.from_date && data.to_date){
             teacherCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
          }
          
          teacherslib.getTeachers(teacherCondition,function(err,registered_teachers) {
             if (err) {
                  callback(err);
              }else{
                  teachersReportObj.registered_teachers = registered_teachers;
                  callback(null,appSetting,registered_teachers);
              }
              
          });
         
         },
         function loggedInTeachers(appSetting,registered_teachers, callback){
               var teacherLoggedInCondition = {active:true, enabled: true,isLoggedIn:1,$or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]};
                if(data.from_date && data.to_date){
                   teacherLoggedInCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }
              teacherslib.TeachersCount(teacherLoggedInCondition,function(err,loggedin_teacher) {
                  if (err) {
                       callback(err);
                  }else{
                       teachersReportObj.loggedin_teacher = loggedin_teacher;
                       callback(null,appSetting,registered_teachers, loggedin_teacher);
                  }
                  
              });
             
            },
        function students(appSetting, registered_teachers, loggedin_teacher, callback){
              var studentsCount = 0;
              var studentsCondition = {active:true, enabled: true};
                if(data.from_date && data.to_date){
                   studentsCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }
               
              studentslib.getStudents(studentsCondition,function(err,students) {
                  if (err) {
                   callback(err);
                  }else{
                      async.forEachOf(registered_teachers, function(data, key, asynCallback) {
                        var filterStudents = students.filter(function(studentObj){
                             return studentObj.teacherId.toString() == data._id.toString(); 
                        });

                        studentsCount += filterStudents.length;
                        asynCallback();
                      },function(err){
                         if(err){
                            callback(err);
                         }else{
                           teachersReportObj.students = studentsCount;
                           var students_count = studentsCount
                           callback(null,appSetting, registered_teachers, loggedin_teacher, students_count);
                         }
                      });
                      
                      
                  }
                  
              });
             
            },
        function schooles(appSetting, registered_teachers, loggedin_teacher, students_count, callback){
                var schoolsCondition = {active:true, enabled: true};
                if(data.from_date && data.to_date){
                   schoolsCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }
               schoolslib.getSchoolsData(schoolsCondition,{},function(err,schooles) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersReportObj.schooles = schooles.length;
                      callback(null,appSetting ,registered_teachers, loggedin_teacher, students_count, schooles);
                  }
                  
              });
             
            },
            function counties(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, callback){
               var countyCondition = {active:true, enabled: true};
                if(data.from_date && data.to_date){
                    countyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }
               districtslib.getCounties(countyCondition,function(err,counties) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersReportObj.counties = counties.length;
                      callback(null,appSetting ,registered_teachers, loggedin_teacher, students_count, schooles, counties);
                  }
                  
              });
             
            }, 
           function districts(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, callback){
                var districtCondition = {active:true, enabled: true};
                if(data.from_date && data.to_date){
                    districtCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                } 
               districtslib.getDistricts(districtCondition,function(err,districts) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersReportObj.districts = districts.length;
                      callback(null,appSetting ,registered_teachers, loggedin_teacher, students_count, schooles, counties, districts);
                  }
                  
              });
             
            },
             function grossProfit(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, callback){
                var schoolProfitCondition = {active:true, enabled: true, amount:{ $gt: 0}};
                if(data.from_date && data.to_date){
                    schoolProfitCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                } 
               schoolslib.getSchoolsData(schoolProfitCondition,{},function(err,gross_profit) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersReportObj.gross_profit = 0;
                      gross_profit.forEach(function(data){
                        teachersReportObj.gross_profit = teachersReportObj.gross_profit+data.amount;
                      });
                      callback(null,appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit);
                  } 
              });
            } ,
            function iep(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, callback){
                     var studentIepCondition = {active:true, enabled: true,$or:[{iep : 'YES'},{iep : 'yes'},{iep : 'Yes'}]};
                      if(data.from_date && data.to_date){
                          studentIepCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      } 
                      studentslib.getStudents(studentIepCondition,function(err,iep_yes) {
                        if (err) {
                         callback(err);
                        }else{
                           var iepPercent = (iep_yes.length/students_count)*100;
                           teachersReportObj.iep = (iepPercent) ? iepPercent : 0;
                          callback(null,appSetting ,registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes);
                        }
                      });                                             
             },   
            function preSchool(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, callback){
                      var studentPsCondition = {active:true, enabled: true,$or:[{preSchool : 'YES'},{preSchool : 'yes'},{preSchool : 'Yes'}]};
                      if(data.from_date && data.to_date){
                          studentPsCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      } 
                      studentslib.getStudents(studentPsCondition,function(err,ps_yes) {
                        if (err) {
                         callback(err);
                        }else{
                           var psPercent = (ps_yes.length/students_count)*100;
                           teachersReportObj.ps = (psPercent) ? psPercent : 0;
                          callback(null,appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes);
                        }
                      });                                             
             },
              function TK(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, callback){
                       var studentTkCondition = {active:true, enabled: true,$or:[{transitionalKindergarten : 'YES'},{transitionalKindergarten : 'yes'},{transitionalKindergarten : 'Yes'}]};
                      if(data.from_date && data.to_date){
                          studentTkCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      } 
                      studentslib.getStudents(studentTkCondition,function(err,tk_yes) {
                        if (err) {
                         callback(err);
                        }else{
                           var tkPercent = (tk_yes.length/students_count)*100;
                           teachersReportObj.tk = (tkPercent) ? tkPercent : 0;
                          callback(null,appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes);
                        }
                      });                                             
             },
             function literacy(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes, callback){
                 var literacyCondition = {active:true, enabled: true};
                      // if(data.from_date && data.to_date){
                      //     literacyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      // }

                      if(appSetting.assessment_from && appSetting.assessment_to){
                          literacyCondition.createdIso = {$gte:appSetting.assessment_from, $lte:appSetting.assessment_to};
                      }  
                   
                   literacylib.getStudents(literacyCondition,function(err,literacy) {
                    if (err) {
                     callback(err);
                    }else{
                       teachersReportObj.literacy = literacy;
                      callback(null,appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes, literacy);
                    }
                  });                                             
             },
             function numeracy(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes, literacy, callback){
                  var numeracyCondition = {active:true, enabled: true};
                      if(data.from_date && data.to_date){
                          numeracyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      } 
                  numeracylib.getStudents(numeracyCondition,function(err,numeracy) {
                    if (err) {
                     callback(err);
                    }else{
                       teachersReportObj.numeracy = numeracy;
                      callback(null,appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes, literacy, numeracy);
                    }
                  });                                             
             },
             function social(appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes, literacy, numeracy, callback){
                  var socialCondition = {active:true, enabled: true};
                      if(data.from_date && data.to_date){
                          socialCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                      } 
                  sociallib.getStudents(socialCondition,function(err,social) {
                    if (err) {
                     callback(err);
                    }else{
                       teachersReportObj.social = social;
                      callback(null,appSetting, registered_teachers, loggedin_teacher, students_count, schooles, counties, districts, gross_profit, iep_yes, ps_yes, tk_yes, literacy, numeracy,social);
                    }
                  });                                             
             }
             
    
      ], function (err, result) {
        if(err){
          res.json({success:false,data:[],message:'Something went wrong.'});
        }else{
         // result now equals 'done' 
          res.json({success:true, data:teachersReportObj, message:'Teachers reports.'});
        }
        
      });

};


exports.TeacherByMultipleSchools = function(req, res, next) {
   var query = {};
    if (typeof req.body.sid !== 'undefined') {
        var schoolIdArr = [];
        req.body.sid.forEach(function(result){
            schoolIdArr.push(utils.toObjectId(result));        
        })
         query = {
            schoolId: {
                $in: schoolIdArr
            },
            enabled: true,
            active: true
        };

    } else {
         query = {
            enabled: true,
            active: true
        };
    }
    
    if(req.body.from_date && req.body.to_date){
        query.createdIso = {$gte:req.body.from_date, $lte:req.body.to_date};
    } 
    teacherslib.getTeachers(query, function(err, teachers) {
        if (err) {
            return next(err);
        }
        req.store.set('teachers', teachers);
        next();
    });
};


exports.getTeachersBySchoolIds = function(req, res, next) 
{   var ids = [];
    var data = req.body;
    var condition ={active : true,enabled : true};
    data.school_id.forEach(function(result){
        ids.push(utils.toObjectId(result));        
    })
    if(ids.length || data.filter){
      condition.schoolId={$in:ids};
    }

    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    teacherslib.getTeachers(condition, function(err, students) 
    {
        if (err) {
            res.json({success:true,data:[],message:err});
        }else{
           res.json({success:true,data:students,message:'Students list.'});
       }
    });
};

exports.removeStudentsWithoutTeachers = function(req, res, next){
  var teachersReportObj = {};
   var removedTeachers = 0;
      async.waterfall([
        function all_teachers(callback){
            teacherslib.getTeachers({active:true, enabled: true},function(err,all_teachers) {
                  if (err) {
                       callback(err);
                  }else{
                       //teachersReportObj.all_teachers = all_teachers;
                       
                       callback(null,all_teachers);
                  }
                  
            });
             
        },
        function students(all_teachers,callback){
          var all_ids = [];
              for (var i = 0; i < all_teachers.length; i++) {
                 all_ids.push(utils.toObjectId(all_teachers[i]._id));
               } 
                studentslib.updateMultipleStudents({ teacherId: { $nin: all_ids } },{ $set : {active: false, enabled:false }}, function(err, numRemoved){
                    if (err) {
                         return next(err);
                    } else {
                        removedTeachers = numRemoved;
                         callback(null,all_teachers,numRemoved);
                        }
                   
                });
            },          
    
      ], function (err, result) {
        if(err){
          res.json({success:false,data:[],message:'Something went wrong.'});
        }else{
         // result now equals 'done' 
          res.json({success:true, data:removedTeachers, message:'Teachers reports.'});
        }
        
      });
};
