// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

interface IFocusToken {
    function spend(address user, uint256 amount, string memory reason) external;
}

/**
 * @title ADHDPet
 * @dev 动态NFT宠物系统 - 宠物状态与用户互动链上存储
 * 宠物需要定期喂养和照顾，否则属性会下降
 */
contract ADHDPet is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    // 宠物属性结构
    struct Pet {
        uint8 level;           // 等级 1-100
        uint8 hunger;          // 饥饿度 0-100 (100=最饱)
        uint8 happiness;       // 快乐度 0-100
        uint8 health;          // 健康度 0-100
        uint256 birthTime;     // 出生时间
        uint256 lastUpdate;    // 上次更新时间
        uint256 totalFed;      // 总喂食次数
        uint256 totalPlayed;   // 总互动次数
        bool isAlive;          // 是否存活
    }
    
    // 状态存储
    mapping(uint256 => Pet) public pets;
    mapping(address => uint256[]) public ownerPets;
    mapping(address => bool) public hasFreeMint;
    
    // 合约引用
    IFocusToken public focusToken;
    
    // 计数器
    uint256 private _nextTokenId;
    
    // 价格配置
    uint256 public constant MINT_PRICE = 50 ether; // 50 FOCUS
    uint256 public constant BASIC_FOOD_PRICE = 5 ether;
    uint256 public constant PREMIUM_FOOD_PRICE = 15 ether;
    uint256 public constant LUXURY_FOOD_PRICE = 30 ether;
    uint256 public constant PLAY_PRICE = 10 ether;
    uint256 public constant GROOM_PRICE = 8 ether;
    uint256 public constant MEDICINE_PRICE = 20 ether;
    
    // 时间常量
    uint256 public constant HUNGER_DECAY_TIME = 30 minutes; // 饥饿衰减时间
    uint256 public constant HAPPINESS_DECAY_TIME = 1 hours;  // 快乐衰减时间
    
    // 事件
    event PetMinted(address indexed owner, uint256 indexed tokenId);
    event PetFed(uint256 indexed tokenId, uint8 foodType, uint8 newHunger);
    event PetPlayed(uint256 indexed tokenId, uint8 newHappiness);
    event PetGroomed(uint256 indexed tokenId, uint8 newHealth);
    event PetHealed(uint256 indexed tokenId, uint8 newHealth);
    event PetLeveledUp(uint256 indexed tokenId, uint8 newLevel);
    event PetDied(uint256 indexed tokenId);
    
    constructor(address _focusToken) ERC721("ADHD Focus Pet", "PETFOCUS") Ownable(msg.sender) {
        focusToken = IFocusToken(_focusToken);
    }
    
    /**
     * @dev Mint新宠物
     * 首次免费，后续需要50 FOCUS
     */
    function mintPet() external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        // 检查是否首次免费mint
        if (hasFreeMint[msg.sender]) {
            // 需要消费FOCUS代币
            focusToken.spend(msg.sender, MINT_PRICE, "Mint Pet");
        } else {
            // 首次免费
            hasFreeMint[msg.sender] = true;
        }
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        // 初始化宠物属性
        pets[tokenId] = Pet({
            level: 1,
            hunger: 100,
            happiness: 100,
            health: 100,
            birthTime: block.timestamp,
            lastUpdate: block.timestamp,
            totalFed: 0,
            totalPlayed: 0,
            isAlive: true
        });
        
        // 记录所有权
        ownerPets[msg.sender].push(tokenId);
        
        emit PetMinted(msg.sender, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev 喂养宠物
     * @param tokenId 宠物ID
     * @param foodType 食物类型 (1=小鱼干, 2=高级猫粮, 3=豪华大餐)
     */
    function feed(uint256 tokenId, uint8 foodType) external {
        require(ownerOf(tokenId) == msg.sender, "Not pet owner");
        require(foodType >= 1 && foodType <= 3, "Invalid food type");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is not alive");
        
        // 更新宠物状态
        _updatePetStatus(tokenId);
        
        // 根据食物类型扣除代币和增加属性
        if (foodType == 1) {
            // 小鱼干: 饥饿+20, 快乐+5
            focusToken.spend(msg.sender, BASIC_FOOD_PRICE, "Feed Pet (Basic)");
            pet.hunger = _addStat(pet.hunger, 20);
            pet.happiness = _addStat(pet.happiness, 5);
        } else if (foodType == 2) {
            // 高级猫粮: 饥饿+40, 快乐+15, 健康+10
            focusToken.spend(msg.sender, PREMIUM_FOOD_PRICE, "Feed Pet (Premium)");
            pet.hunger = _addStat(pet.hunger, 40);
            pet.happiness = _addStat(pet.happiness, 15);
            pet.health = _addStat(pet.health, 10);
        } else {
            // 豪华大餐: 饥饿+60, 快乐+30, 健康+20
            focusToken.spend(msg.sender, LUXURY_FOOD_PRICE, "Feed Pet (Luxury)");
            pet.hunger = _addStat(pet.hunger, 60);
            pet.happiness = _addStat(pet.happiness, 30);
            pet.health = _addStat(pet.health, 20);
        }
        
        pet.totalFed++;
        pet.lastUpdate = block.timestamp;
        
        emit PetFed(tokenId, foodType, pet.hunger);
    }
    
    /**
     * @dev 与宠物玩耍
     */
    function play(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not pet owner");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is not alive");
        
        _updatePetStatus(tokenId);
        
        // 消费代币
        focusToken.spend(msg.sender, PLAY_PRICE, "Play with Pet");
        
        // 增加快乐度，减少饥饿度
        pet.happiness = _addStat(pet.happiness, 25);
        pet.hunger = _subStat(pet.hunger, 5);
        pet.totalPlayed++;
        pet.lastUpdate = block.timestamp;
        
        emit PetPlayed(tokenId, pet.happiness);
    }
    
    /**
     * @dev 给宠物梳毛
     */
    function groom(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not pet owner");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is not alive");
        
        _updatePetStatus(tokenId);
        
        // 消费代币
        focusToken.spend(msg.sender, GROOM_PRICE, "Groom Pet");
        
        // 增加健康度和快乐度
        pet.health = _addStat(pet.health, 15);
        pet.happiness = _addStat(pet.happiness, 10);
        pet.lastUpdate = block.timestamp;
        
        emit PetGroomed(tokenId, pet.health);
    }
    
    /**
     * @dev 治疗宠物
     */
    function heal(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not pet owner");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is not alive");
        
        _updatePetStatus(tokenId);
        
        // 消费代币
        focusToken.spend(msg.sender, MEDICINE_PRICE, "Heal Pet");
        
        // 大幅恢复健康
        pet.health = _addStat(pet.health, 40);
        pet.happiness = _addStat(pet.happiness, 5);
        pet.lastUpdate = block.timestamp;
        
        emit PetHealed(tokenId, pet.health);
    }
    
    /**
     * @dev 升级宠物
     * 条件：总属性值 >= level * 250
     */
    function levelUp(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not pet owner");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is not alive");
        require(pet.level < 100, "Max level reached");
        
        _updatePetStatus(tokenId);
        
        // 检查升级条件
        uint256 totalStats = uint256(pet.hunger) + uint256(pet.happiness) + uint256(pet.health);
        uint256 requiredStats = uint256(pet.level) * 250;
        require(totalStats >= requiredStats, "Not enough stats to level up");
        
        // 升级
        pet.level++;
        
        // 奖励：所有属性+20
        pet.hunger = _addStat(pet.hunger, 20);
        pet.happiness = _addStat(pet.happiness, 20);
        pet.health = _addStat(pet.health, 20);
        
        emit PetLeveledUp(tokenId, pet.level);
    }
    
    /**
     * @dev 更新宠物状态（自动衰减）
     */
    function updatePetStatus(uint256 tokenId) external {
        _updatePetStatus(tokenId);
    }
    
    /**
     * @dev 获取用户的所有宠物
     */
    function getPetsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerPets[owner];
    }
    
    /**
     * @dev 获取宠物详细信息
     */
    function getPetInfo(uint256 tokenId) external view returns (Pet memory) {
        return pets[tokenId];
    }
    
    /**
     * @dev 生成动态tokenURI（链上metadata）
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        _requireOwned(tokenId);
        
        Pet memory pet = pets[tokenId];
        
        // 根据等级选择宠物表情
        string memory petEmoji = _getPetEmoji(pet);
        string memory statusText = _getStatusText(pet);
        
        // 构建JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "ADHD Focus Pet #', tokenId.toString(), '",',
                        '"description": "A dynamic NFT pet that grows with your focus and learning journey",',
                        '"image": "data:image/svg+xml;base64,', _generateSVG(tokenId, pet, petEmoji), '",',
                        '"attributes": [',
                            '{"trait_type": "Level", "value": ', uint256(pet.level).toString(), '},',
                            '{"trait_type": "Hunger", "value": ', uint256(pet.hunger).toString(), '},',
                            '{"trait_type": "Happiness", "value": ', uint256(pet.happiness).toString(), '},',
                            '{"trait_type": "Health", "value": ', uint256(pet.health).toString(), '},',
                            '{"trait_type": "Status", "value": "', statusText, '"},',
                            '{"trait_type": "Alive", "value": "', pet.isAlive ? 'Yes' : 'No', '"}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    // ========== 内部函数 ==========
    
    /**
     * @dev 内部状态更新逻辑
     */
    function _updatePetStatus(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        
        if (!pet.isAlive) return;
        
        uint256 timePassed = block.timestamp - pet.lastUpdate;
        
        // 饥饿度衰减 (每30分钟-5)
        uint256 hungerDecay = (timePassed / HUNGER_DECAY_TIME) * 5;
        if (hungerDecay > 0) {
            pet.hunger = _subStat(pet.hunger, uint8(hungerDecay > 255 ? 255 : hungerDecay));
        }
        
        // 快乐度衰减 (每1小时-3)
        uint256 happinessDecay = (timePassed / HAPPINESS_DECAY_TIME) * 3;
        if (happinessDecay > 0) {
            pet.happiness = _subStat(pet.happiness, uint8(happinessDecay > 255 ? 255 : happinessDecay));
        }
        
        // 健康度受饥饿和快乐影响
        if (pet.hunger < 30 || pet.happiness < 30) {
            uint256 healthDecay = (timePassed / HAPPINESS_DECAY_TIME) * 2;
            if (healthDecay > 0) {
                pet.health = _subStat(pet.health, uint8(healthDecay > 255 ? 255 : healthDecay));
            }
        }
        
        // 检查是否死亡
        if (pet.health == 0) {
            pet.isAlive = false;
            emit PetDied(tokenId);
        }
        
        pet.lastUpdate = block.timestamp;
    }
    
    /**
     * @dev 安全增加属性值（不超过100）
     */
    function _addStat(uint8 current, uint8 add) internal pure returns (uint8) {
        uint256 result = uint256(current) + uint256(add);
        return result > 100 ? 100 : uint8(result);
    }
    
    /**
     * @dev 安全减少属性值（不低于0）
     */
    function _subStat(uint8 current, uint8 sub) internal pure returns (uint8) {
        return current > sub ? current - sub : 0;
    }
    
    /**
     * @dev 根据宠物状态获取表情
     */
    function _getPetEmoji(Pet memory pet) internal pure returns (string memory) {
        if (!pet.isAlive) return unicode"💀";
        if (pet.health < 20) return unicode"🤒";
        if (pet.hunger < 30) return unicode"😿";
        if (pet.happiness > 80) return unicode"😺";
        return unicode"😸";
    }
    
    /**
     * @dev 获取状态文本
     */
    function _getStatusText(Pet memory pet) internal pure returns (string memory) {
        if (!pet.isAlive) return "Dead";
        if (pet.health < 20) return "Sick";
        if (pet.hunger < 30) return "Hungry";
        if (pet.happiness < 30) return "Sad";
        return "Healthy";
    }
    
    /**
     * @dev 生成SVG图片
     */
    function _generateSVG(uint256 tokenId, Pet memory pet, string memory emoji) internal pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
                '<rect width="400" height="400" fill="#E8F4F8"/>',
                '<text x="200" y="150" font-size="120" text-anchor="middle">', emoji, '</text>',
                '<text x="200" y="220" font-size="24" text-anchor="middle" fill="#333">Pet #', tokenId.toString(), '</text>',
                '<text x="200" y="250" font-size="18" text-anchor="middle" fill="#666">Level ', uint256(pet.level).toString(), '</text>',
                '<text x="50" y="300" font-size="14" fill="#333">Hunger: ', uint256(pet.hunger).toString(), '%</text>',
                '<text x="50" y="330" font-size="14" fill="#333">Happiness: ', uint256(pet.happiness).toString(), '%</text>',
                '<text x="50" y="360" font-size="14" fill="#333">Health: ', uint256(pet.health).toString(), '%</text>',
                '</svg>'
            )
        );
        
        return Base64.encode(bytes(svg));
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}


