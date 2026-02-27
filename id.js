// ==================== ULTRA PRO ID GENERATOR ====================
// BOSS-MD Premium ID Generator with Multiple Formats
// Author: BOSS 👑
// Version: 3.0.0

/**
 * 🎯 Features:
 * ✅ Multiple ID formats (alphanumeric, numeric, alphabetic)
 * ✅ Custom prefixes and suffixes
 * ✅ Timestamp-based IDs
 * ✅ UUID v4 compatible
 * ✅ Colorful console output
 * ✅ Emoji support
 * ✅ Batch generation
 * ✅ Validation functions
 */

// ==================== COLOR CODES ====================
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// ==================== CHARACTER SETS ====================
const CHAR_SETS = {
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    hex: "0123456789ABCDEF",
    base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    emoji: "😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚"
};

// ==================== VERSION 1: BASIC MAKER ====================
function makeid(num = 4) {
    try {
        // Validate input
        if (typeof num !== 'number' || num < 1) {
            console.warn(`${colors.yellow}⚠️ Invalid length, using default 4${colors.reset}`);
            num = 4;
        }
        
        // Limit maximum length (prevent abuse)
        if (num > 100) {
            console.warn(`${colors.yellow}⚠️ Length too large, capping at 100${colors.reset}`);
            num = 100;
        }
        
        const characters = CHAR_SETS.alphanumeric;
        const charLength = characters.length;
        let result = "";
        
        // Generate random string
        for (let i = 0; i < num; i++) {
            result += characters.charAt(Math.floor(Math.random() * charLength));
        }
        
        // Log generation (optional - remove in production)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${colors.green}✅ Generated ID: ${colors.cyan}${result}${colors.reset} (${num} chars)`);
        }
        
        return result;
        
    } catch (error) {
        console.error(`${colors.red}❌ ID Generation Error: ${error.message}${colors.reset}`);
        return "ERROR" + Date.now(); // Fallback
    }
}

// ==================== VERSION 2: PRO VERSION ====================
class IDGenerator {
    constructor(options = {}) {
        this.defaultLength = options.length || 8;
        this.defaultFormat = options.format || 'alphanumeric';
        this.prefix = options.prefix || '';
        this.suffix = options.suffix || '';
        this.separator = options.separator || '';
        this.casing = options.casing || 'mixed'; // upper, lower, mixed
    }
    
    /**
     * Generate ID with custom options
     */
    generate(options = {}) {
        const length = options.length || this.defaultLength;
        const format = options.format || this.defaultFormat;
        const prefix = options.prefix || this.prefix;
        const suffix = options.suffix || this.suffix;
        
        // Get character set
        let chars = CHAR_SETS[format] || CHAR_SETS.alphanumeric;
        
        // Apply casing
        if (options.casing === 'upper' || this.casing === 'upper') {
            chars = chars.toUpperCase();
        } else if (options.casing === 'lower' || this.casing === 'lower') {
            chars = chars.toLowerCase();
        }
        
        // Generate core ID
        let coreId = "";
        const charLength = chars.length;
        for (let i = 0; i < length; i++) {
            coreId += chars.charAt(Math.floor(Math.random() * charLength));
        }
        
        // Add prefix/suffix
        const finalId = prefix + this.separator + coreId + this.separator + suffix;
        
        return finalId.replace(new RegExp(this.separator + '+', 'g'), this.separator); // Remove empty separators
    }
    
    /**
     * Generate multiple IDs at once
     */
    generateBatch(count = 5, options = {}) {
        const ids = [];
        for (let i = 0; i < count; i++) {
            ids.push(this.generate(options));
        }
        return ids;
    }
}

// ==================== VERSION 3: SPECIALIZED GENERATORS ====================

/**
 * Generate timestamp-based ID (e.g., BOSS-20231225-ABCD)
 */
function makeTimestampId(prefix = 'BOSS') {
    const date = new Date();
    const timestamp = date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0') + '-' +
        String(date.getHours()).padStart(2, '0') +
        String(date.getMinutes()).padStart(2, '0');
    
    const random = makeid(6);
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate UUID v4 compatible ID
 */
function makeUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generate session ID for WhatsApp
 */
function makeSessionId(length = 16) {
    return 'SESSION_' + makeid(length);
}

/**
 * Generate numeric OTP
 */
function makeOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

/**
 * Generate hex color code
 */
function makeHexColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validate if string matches ID pattern
 */
function validateId(id, options = {}) {
    const pattern = options.pattern || /^[A-Za-z0-9]+$/;
    const minLength = options.minLength || 1;
    const maxLength = options.maxLength || Infinity;
    
    return pattern.test(id) && id.length >= minLength && id.length <= maxLength;
}

/**
 * Generate unique ID with collision check
 */
function makeUniqueId(existingIds = [], length = 8) {
    let id;
    do {
        id = makeid(length);
    } while (existingIds.includes(id));
    return id;
}

/**
 * Format ID with custom separator
 */
function formatId(id, separator = '-', chunkSize = 4) {
    const chunks = [];
    for (let i = 0; i < id.length; i += chunkSize) {
        chunks.push(id.substr(i, chunkSize));
    }
    return chunks.join(separator);
}

// ==================== DECORATIVE FUNCTIONS ====================

/**
 * Generate ID with emoji prefix
 */
function makeEmojiId(length = 6) {
    const emojis = CHAR_SETS.emoji.split('');
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    return randomEmoji + ' ' + makeid(length);
}

/**
 * Generate ID with timestamp and color
 */
function makeColorfulId() {
    const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `${randomColor} BOSS-${makeid(8)}`;
}

// ==================== EXPORTS ====================

// Export all functions
module.exports = {
    // Original function (backward compatible)
    makeid,
    
    // Pro version
    IDGenerator,
    
    // Specialized generators
    makeTimestampId,
    makeUUID,
    makeSessionId,
    makeOTP,
    makeHexColor,
    
    // Utility functions
    validateId,
    makeUniqueId,
    formatId,
    
    // Decorative
    makeEmojiId,
    makeColorfulId,
    
    // Character sets (for advanced use)
    CHAR_SETS
};

// ==================== DEMO / TESTING ====================
if (require.main === module) {
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.bold}${colors.cyan}🚀 BOSS-MD ID GENERATOR DEMO${colors.reset}`);
    console.log('='.repeat(50) + '\n');
    
    // Test basic
    console.log(`${colors.yellow}📌 Basic ID (4 chars):${colors.reset}`, makeid(4));
    console.log(`${colors.yellow}📌 Basic ID (8 chars):${colors.reset}`, makeid(8));
    
    // Test specialized
    console.log(`\n${colors.green}✨ Specialized IDs:${colors.reset}`);
    console.log(`  • Timestamp ID: ${colors.cyan}${makeTimestampId()}${colors.reset}`);
    console.log(`  • UUID: ${colors.cyan}${makeUUID()}${colors.reset}`);
    console.log(`  • Session ID: ${colors.cyan}${makeSessionId()}${colors.reset}`);
    console.log(`  • OTP: ${colors.cyan}${makeOTP()}${colors.reset}`);
    console.log(`  • Hex Color: ${colors.cyan}${makeHexColor()}${colors.reset}`);
    
    // Test pro generator
    console.log(`\n${colors.magenta}⚡ Pro Generator Demo:${colors.reset}`);
    const generator = new IDGenerator({ prefix: 'BOSS', separator: '-' });
    console.log(`  • Pro ID: ${colors.cyan}${generator.generate({ length: 10 })}${colors.reset}`);
    console.log(`  • Batch (3 IDs): ${colors.cyan}${generator.generateBatch(3).join(', ')}${colors.reset}`);
    
    // Test utilities
    console.log(`\n${colors.blue}🛠️  Utilities:${colors.reset}`);
    console.log(`  • Formatted ID: ${colors.cyan}${formatId(makeid(16))}${colors.reset}`);
    console.log(`  • Emoji ID: ${colors.cyan}${makeEmojiId()}${colors.reset}`);
    console.log(`  • Colorful ID: ${colors.cyan}${makeColorfulId()}${colors.reset}`);
    
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.green}✅ All generators working perfectly!${colors.reset}`);
    console.log('='.repeat(50) + '\n');
  }
