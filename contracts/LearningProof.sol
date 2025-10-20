// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title LearningProof
 * @dev 灵魂绑定学习证书NFT (Soulbound Token)
 * 证书不可转移，永久绑定到学习者地址
 * 可作为链上学习简历和成就证明
 */
contract LearningProof is ERC721, Ownable {
    using Strings for uint256;
    
    // 证书结构
    struct Certificate {
        uint256 lessonId;          // 课程ID
        uint256 completionTime;    // 完成时间
        uint256 studyDuration;     // 学习时长(秒)
        address student;           // 学习者地址
    }
    
    // 证书存储
    mapping(uint256 => Certificate) public certificates;
    
    // 学生的所有证书 student => tokenIds
    mapping(address => uint256[]) public studentCertificates;
    
    // 学生完成的课程 student => lessonId => tokenId
    mapping(address => mapping(uint256 => uint256)) public lessonCertificates;
    
    // 授权发证者（FocusManager合约）
    mapping(address => bool) public authorizedIssuers;
    
    // 课程名称映射
    mapping(uint256 => string) public lessonNames;
    
    // 计数器
    uint256 private _nextTokenId;
    
    // 事件
    event CertificateIssued(address indexed student, uint256 indexed tokenId, uint256 indexed lessonId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    constructor() ERC721("ADHD Learning Certificate", "CERT") Ownable(msg.sender) {
        // 初始化课程名称
        lessonNames[1] = unicode"区块链基础";
        lessonNames[2] = unicode"加密技术";
        lessonNames[3] = unicode"去中心化网络";
        lessonNames[4] = unicode"加密货币";
        lessonNames[5] = unicode"智能合约";
        lessonNames[6] = unicode"DeFi应用";
    }
    
    /**
     * @dev 颁发学习证书
     * 只能由授权的发证者调用（通常是FocusManager合约）
     */
    function issueCertificate(
        address student,
        uint256 lessonId,
        uint256 studyDuration
    ) external returns (uint256) {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        require(student != address(0), "Invalid student address");
        require(lessonId >= 1 && lessonId <= 6, "Invalid lesson ID");
        require(lessonCertificates[student][lessonId] == 0, "Certificate already issued");
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint证书NFT
        _safeMint(student, tokenId);
        
        // 记录证书信息
        certificates[tokenId] = Certificate({
            lessonId: lessonId,
            completionTime: block.timestamp,
            studyDuration: studyDuration,
            student: student
        });
        
        // 记录索引
        studentCertificates[student].push(tokenId);
        lessonCertificates[student][lessonId] = tokenId;
        
        emit CertificateIssued(student, tokenId, lessonId);
        
        return tokenId;
    }
    
    /**
     * @dev 添加授权发证者
     */
    function addAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    /**
     * @dev 移除授权发证者
     */
    function removeAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    /**
     * @dev 更新课程名称
     */
    function updateLessonName(uint256 lessonId, string memory name) external onlyOwner {
        require(lessonId >= 1 && lessonId <= 6, "Invalid lesson ID");
        lessonNames[lessonId] = name;
    }
    
    /**
     * @dev 获取学生的所有证书
     */
    function getCertificatesByStudent(address student) external view returns (uint256[] memory) {
        return studentCertificates[student];
    }
    
    /**
     * @dev 检查学生是否有某课程证书
     */
    function hasCertificate(address student, uint256 lessonId) external view returns (bool) {
        return lessonCertificates[student][lessonId] != 0;
    }
    
    /**
     * @dev 获取证书信息
     */
    function getCertificateInfo(uint256 tokenId) external view returns (Certificate memory) {
        return certificates[tokenId];
    }
    
    /**
     * @dev 生成动态tokenURI（链上证书）
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        Certificate memory cert = certificates[tokenId];
        string memory lessonName = lessonNames[cert.lessonId];
        
        // 格式化时间
        string memory completionDate = _formatTimestamp(cert.completionTime);
        string memory duration = _formatDuration(cert.studyDuration);
        
        // 构建JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', lessonName, ' - Learning Certificate",',
                        '"description": "Soulbound certificate proving completion of ', lessonName, ' course",',
                        '"image": "data:image/svg+xml;base64,', _generateCertificateSVG(tokenId, cert, lessonName, completionDate, duration), '",',
                        '"attributes": [',
                            '{"trait_type": "Course", "value": "', lessonName, '"},',
                            '{"trait_type": "Lesson ID", "value": ', cert.lessonId.toString(), '},',
                            '{"trait_type": "Completion Date", "value": "', completionDate, '"},',
                            '{"trait_type": "Study Duration", "value": "', duration, '"},',
                            '{"trait_type": "Type", "value": "Soulbound"},',
                            '{"trait_type": "Transferable", "value": "No"}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    /**
     * @dev 禁止转移 - 灵魂绑定机制
     * 只允许mint，不允许任何形式的转移
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // 只允许mint (from == address(0))
        // 禁止所有转移操作
        if (from != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    // ========== 内部辅助函数 ==========
    
    /**
     * @dev 格式化时间戳为可读日期
     */
    function _formatTimestamp(uint256 timestamp) internal pure returns (string memory) {
        // 简化版本：只显示时间戳
        // 生产环境可以使用更复杂的日期格式化
        return timestamp.toString();
    }
    
    /**
     * @dev 格式化学习时长
     */
    function _formatDuration(uint256 seconds_) internal pure returns (string memory) {
        uint256 mins = seconds_ / 60;
        uint256 secs = seconds_ % 60;
        
        return string(abi.encodePacked(
            mins.toString(),
            "m ",
            secs.toString(),
            "s"
        ));
    }
    
    /**
     * @dev 生成证书SVG
     */
    function _generateCertificateSVG(
        uint256 tokenId,
        Certificate memory cert,
        string memory lessonName,
        string memory completionDate,
        string memory duration
    ) internal pure returns (string memory) {
        // 根据课程ID选择颜色
        string memory accentColor = _getLessonColor(cert.lessonId);
        
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350">',
                '<defs>',
                '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:', accentColor, ';stop-opacity:0.3" />',
                '<stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="500" height="350" fill="url(#grad)" stroke="', accentColor, '" stroke-width="3"/>',
                '<text x="250" y="50" font-size="28" font-weight="bold" text-anchor="middle" fill="#333">',
                unicode"🎓 学习证书",
                '</text>',
                '<text x="250" y="90" font-size="16" text-anchor="middle" fill="#666">ADHD Focus Learning Platform</text>',
                '<rect x="50" y="110" width="400" height="2" fill="', accentColor, '"/>',
                '<text x="250" y="150" font-size="20" font-weight="bold" text-anchor="middle" fill="#333">',
                lessonName,
                '</text>',
                '<text x="250" y="190" font-size="14" text-anchor="middle" fill="#666">Certificate #', tokenId.toString(), '</text>',
                '<text x="80" y="230" font-size="12" fill="#666">Study Duration: ', duration, '</text>',
                '<text x="80" y="260" font-size="12" fill="#666">Completion: ', completionDate, '</text>',
                '<text x="250" y="310" font-size="11" text-anchor="middle" fill="#999">',
                unicode"✨ Soulbound Token - Non-Transferable ✨",
                '</text>',
                '</svg>'
            )
        );
        
        return Base64.encode(bytes(svg));
    }
    
    /**
     * @dev 根据课程ID获取颜色
     */
    function _getLessonColor(uint256 lessonId) internal pure returns (string memory) {
        if (lessonId == 1) return "#4A90E2"; // 蓝色
        if (lessonId == 2) return "#7B68EE"; // 紫色
        if (lessonId == 3) return "#50C878"; // 绿色
        if (lessonId == 4) return "#FFB347"; // 橙色
        if (lessonId == 5) return "#FF6B9D"; // 粉色
        if (lessonId == 6) return "#20B2AA"; // 青色
        return "#4A90E2";
    }
}

