#include <Geode/Geode.hpp>
#include <Geode/modify/MenuLayer.hpp>

using namespace geode::prelude;

class $modify(EasyJukeboxMenu, MenuLayer) {
    bool init() {
        if (!MenuLayer::init()) {
            return false;
        }

        auto label = CCLabelBMFont::create("EASY JUKEBOX", "goldFont.fnt");
        if (!label) {
            return true;
        }

        label->setScale(0.42f);

        auto button = CCMenuItemLabel::create(
            label,
            this,
            menu_selector(EasyJukeboxMenu::onEasyJukebox)
        );

        if (!button) {
            return true;
        }

        auto menu = CCMenu::create(button, nullptr);
        menu->setPosition(CCPointZero);
        button->setPosition({ 82.f, 28.f });
        this->addChild(menu, 100);

        return true;
    }

    void onEasyJukebox(CCObject*) {
        FLAlertLayer::create(
            "Easy Jukebox",
            "A biblioteca comunitaria sera carregada aqui.\n\n"
            "Este e o ponto de entrada inicial do mod. "
            "Configure a URL do servidor e conecte a API para listar, "
            "enviar e baixar musicas.",
            "Fechar"
        )->show();
    }
};
